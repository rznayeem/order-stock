import { prisma } from "@repo/database";
import { ICreateOrder, GetOrdersParams } from "./order.interface";
import AppError from "../../errors/AppError";
import { ProductService } from "../Product/product.service";

const createOrder = async (data: ICreateOrder) => {
  const { customerName, items, userId } = data;

  // === CONFLICT DETECTION ===
  // 1. Check for duplicate products in the same order
  const productIds = items.map((i) => i.productId);
  const uniqueIds = new Set(productIds);
  if (uniqueIds.size !== productIds.length) {
    throw new AppError(400, "Duplicate product entries found in the order. Each product should appear only once.");
  }

  // 2. Fetch all products and validate
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, userId },
  });

  if (products.length !== productIds.length) {
    throw new AppError(400, "One or more products not found");
  }

  // 3. Check for inactive products
  const inactiveProducts = products.filter((p) => p.status === "OUT_OF_STOCK");
  if (inactiveProducts.length > 0) {
    const names = inactiveProducts.map((p) => p.name).join(", ");
    throw new AppError(400, `The following products are currently unavailable: ${names}`);
  }

  // 4. Check stock availability
  const stockIssues: string[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (product && item.quantity > product.stockQuantity) {
      stockIssues.push(`Only ${product.stockQuantity} units available for "${product.name}" (requested: ${item.quantity})`);
    }
  }
  if (stockIssues.length > 0) {
    throw new AppError(400, stockIssues.join("; "));
  }

  // === CREATE ORDER IN TRANSACTION ===
  const result = await prisma.$transaction(async (tx) => {
    // Build order items with prices
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: product.price * item.quantity,
      };
    });

    const totalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order
    const order = await tx.order.create({
      data: {
        customerName,
        totalPrice,
        userId,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    // Deduct stock for each product
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
        },
      });
    }

    return order;
  });

  // Post-transaction: check stock levels and update statuses
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (product) {
      if (product.stockQuantity <= 0) {
        await prisma.product.update({ where: { id: item.productId }, data: { status: "OUT_OF_STOCK" } });
      }
      await ProductService.checkAndAddToRestockQueue(item.productId, userId);
    }
  }

  await prisma.activityLog.create({
    data: {
      userId,
      type: "ORDER_CREATED",
      message: `Order #${result.orderNumber} created for "${customerName}" — $${result.totalPrice.toFixed(2)}`,
      metadata: { orderId: result.id, orderNumber: result.orderNumber },
    },
  });

  return result;
};

const getOrders = async (params: GetOrdersParams) => {
  const { userId, search, status, dateFrom, dateTo, sort = "-createdAt", page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { orderNumber: !isNaN(Number(search)) ? Number(search) : undefined },
    ].filter(Boolean);
  }
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
  }

  const orderBy = sort.startsWith("-") ? { [sort.substring(1)]: "desc" } : { [sort]: "asc" };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: { include: { category: true } } } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
};

const getOrderById = async (id: string, userId: string) => {
  return prisma.order.findFirst({
    where: { id, userId },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
};

const updateOrderStatus = async (id: string, userId: string, status: string) => {
  const order = await prisma.order.findFirst({ where: { id, userId } });
  if (!order) throw new AppError(404, "Order not found");

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new AppError(400, `Cannot change order status from ${order.status} to ${status}`);
  }

  const result = await prisma.order.update({
    where: { id },
    data: { status: status as any },
    include: { items: { include: { product: true } } },
  });

  // If cancelled, restore stock
  if (status === "CANCELLED") {
    for (const item of result.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { increment: item.quantity },
          status: "ACTIVE",
        },
      });
      // Remove from restock queue if stock restored above threshold
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product && product.stockQuantity >= product.minStockThreshold) {
        await prisma.restockQueue.deleteMany({ where: { productId: item.productId } });
      }
    }
  }

  const activityType = status === "CANCELLED" ? "ORDER_CANCELLED" : status === "SHIPPED" ? "ORDER_SHIPPED" : status === "DELIVERED" ? "ORDER_DELIVERED" : "ORDER_UPDATED";

  await prisma.activityLog.create({
    data: {
      userId,
      type: activityType,
      message: `Order #${result.orderNumber} marked as ${status}`,
      metadata: { orderId: id, orderNumber: result.orderNumber, status },
    },
  });

  return result;
};

export const OrderService = { createOrder, getOrders, getOrderById, updateOrderStatus };
