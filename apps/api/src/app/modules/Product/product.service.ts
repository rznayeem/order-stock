import { prisma } from "@repo/database";
import { IProduct, GetProductsParams } from "./product.interface";
import AppError from "../../errors/AppError";

const checkAndAddToRestockQueue = async (productId: string, userId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  if (product.stockQuantity <= 0) {
    await prisma.product.update({ where: { id: productId }, data: { status: "OUT_OF_STOCK" } });
  }

  if (product.stockQuantity < product.minStockThreshold) {
    const priority = product.stockQuantity === 0 ? "HIGH" : product.stockQuantity <= product.minStockThreshold / 2 ? "MEDIUM" : "LOW";

    await prisma.restockQueue.upsert({
      where: { productId },
      create: { productId, userId, priority },
      update: { priority },
    });

    await prisma.activityLog.create({
      data: { userId, type: "RESTOCK_QUEUE_ADDED", message: `"${product.name}" added to restock queue (${priority} priority)`, metadata: { productId, stockQuantity: product.stockQuantity } },
    });
  }
};

const createProduct = async (data: IProduct) => {
  const result = await prisma.product.create({
    data: { ...data, status: data.stockQuantity > 0 ? "ACTIVE" : "OUT_OF_STOCK" },
    include: { category: true },
  });

  await prisma.activityLog.create({
    data: { userId: data.userId, type: "PRODUCT_ADDED", message: `Product "${result.name}" added with ${result.stockQuantity} units`, metadata: { productId: result.id } },
  });

  if (result.stockQuantity < result.minStockThreshold) {
    await checkAndAddToRestockQueue(result.id, data.userId);
  }

  return result;
};

const getProducts = async (params: GetProductsParams) => {
  const { userId, search, categoryId, status, sort = "-createdAt", page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  const orderBy = sort.startsWith("-") ? { [sort.substring(1)]: "desc" } : { [sort]: "asc" };

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
};

const getProductById = async (id: string, userId: string) => {
  return prisma.product.findFirst({ where: { id, userId }, include: { category: true } });
};

const updateProduct = async (id: string, userId: string, data: Partial<IProduct>) => {
  const result = await prisma.product.update({
    where: { id, userId },
    data: {
      ...data,
      ...(data.stockQuantity !== undefined && { status: data.stockQuantity > 0 ? "ACTIVE" : "OUT_OF_STOCK" }),
    },
    include: { category: true },
  });

  await prisma.activityLog.create({
    data: { userId, type: "PRODUCT_UPDATED", message: `Product "${result.name}" updated`, metadata: { productId: id } },
  });

  if (data.stockQuantity !== undefined) {
    await checkAndAddToRestockQueue(id, userId);
    // Remove from restock queue if stock is now above threshold
    if (result.stockQuantity >= result.minStockThreshold) {
      await prisma.restockQueue.deleteMany({ where: { productId: id } });
    }
  }

  return result;
};

const deleteProduct = async (id: string, userId: string) => {
  const product = await prisma.product.findFirst({ where: { id, userId } });
  if (!product) throw new AppError(404, "Product not found");

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) throw new AppError(400, "Cannot delete product with existing orders");

  await prisma.restockQueue.deleteMany({ where: { productId: id } });
  return prisma.product.delete({ where: { id, userId } });
};

const restockProduct = async (id: string, userId: string, quantity: number) => {
  const product = await prisma.product.findFirst({ where: { id, userId } });
  if (!product) throw new AppError(404, "Product not found");

  const newQuantity = product.stockQuantity + quantity;
  const result = await prisma.product.update({
    where: { id },
    data: { stockQuantity: newQuantity, status: "ACTIVE" },
    include: { category: true },
  });

  if (newQuantity >= product.minStockThreshold) {
    await prisma.restockQueue.deleteMany({ where: { productId: id } });
  }

  await prisma.activityLog.create({
    data: { userId, type: "PRODUCT_RESTOCKED", message: `Stock updated for "${result.name}": +${quantity} units (now ${newQuantity})`, metadata: { productId: id, addedQuantity: quantity, newQuantity } },
  });

  return result;
};

export const ProductService = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, restockProduct, checkAndAddToRestockQueue };
