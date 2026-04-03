import { prisma } from "./prisma";
import { hashPassword } from "better-auth/crypto";
import { randomBytes } from "crypto";

/**
 * Seed script for OrderStock
 * Creates a demo account with sample categories, products, and orders
 * 
 * Demo credentials:
 *   Email: demo@orderstock.com
 *   Password: demo1234
 */

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ==========================================
  // 1. Create Demo User via better-auth tables
  // ==========================================
  const userId = "demo-user-id-orderstock";
  const demoEmail = "demo@orderstock.com";

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (existingUser) {
    console.log("👤 Demo user already exists. Skipping user creation.");
  } else {
    // Create the User record
    await prisma.user.create({
      data: {
        id: userId,
        name: "Demo User",
        email: demoEmail,
        emailVerified: true,
        role: "ADMIN",
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create the Account record (for email/password auth)
    const hashedPassword = await hashPassword("demo1234");
    await prisma.account.create({
      data: {
        id: `demo-account-${randomBytes(8).toString("hex")}`,
        accountId: userId,
        providerId: "credential",
        userId: userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Demo user created: demo@orderstock.com / demo1234");
  }

  const activeUserId = existingUser?.id || userId;

  // ==========================================
  // 2. Create Sample Categories
  // ==========================================
  console.log("\n📁 Creating categories...");
  const categoryData = [
    { name: "Electronics" },
    { name: "Grocery" },
    { name: "Clothing" },
    { name: "Books" },
    { name: "Home & Kitchen" },
  ];

  const categories: any[] = [];
  for (const cat of categoryData) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name, userId: activeUserId } });
    if (existing) {
      categories.push(existing);
      continue;
    }
    const created = await prisma.category.create({
      data: { ...cat, userId: activeUserId },
    });
    categories.push(created);

    await prisma.activityLog.create({
      data: { userId: activeUserId, type: "CATEGORY_CREATED", message: `Category "${cat.name}" created` },
    });
  }
  console.log(`   ✅ ${categories.length} categories ready`);

  // ==========================================
  // 3. Create Sample Products
  // ==========================================
  console.log("\n📦 Creating products...");

  const productData = [
    { name: "iPhone 13", categoryName: "Electronics", price: 999.99, stockQuantity: 3, minStockThreshold: 5 },
    { name: "Samsung Galaxy S21", categoryName: "Electronics", price: 799.99, stockQuantity: 8, minStockThreshold: 5 },
    { name: "Sony WH-1000XM4 Headphones", categoryName: "Electronics", price: 349.99, stockQuantity: 0, minStockThreshold: 3 },
    { name: "MacBook Pro 14\"", categoryName: "Electronics", price: 1999.99, stockQuantity: 12, minStockThreshold: 5 },
    { name: "Organic Rice (5kg)", categoryName: "Grocery", price: 12.99, stockQuantity: 50, minStockThreshold: 20 },
    { name: "Extra Virgin Olive Oil", categoryName: "Grocery", price: 8.49, stockQuantity: 2, minStockThreshold: 10 },
    { name: "Whole Wheat Bread", categoryName: "Grocery", price: 3.99, stockQuantity: 30, minStockThreshold: 15 },
    { name: "Premium Cotton T-Shirt", categoryName: "Clothing", price: 24.99, stockQuantity: 20, minStockThreshold: 10 },
    { name: "Denim Jeans Slim Fit", categoryName: "Clothing", price: 59.99, stockQuantity: 15, minStockThreshold: 5 },
    { name: "Winter Jacket", categoryName: "Clothing", price: 129.99, stockQuantity: 4, minStockThreshold: 5 },
    { name: "Clean Code (Book)", categoryName: "Books", price: 39.99, stockQuantity: 25, minStockThreshold: 5 },
    { name: "Design Patterns (Book)", categoryName: "Books", price: 44.99, stockQuantity: 18, minStockThreshold: 5 },
    { name: "Stainless Steel Water Bottle", categoryName: "Home & Kitchen", price: 19.99, stockQuantity: 35, minStockThreshold: 10 },
    { name: "Non-Stick Frying Pan", categoryName: "Home & Kitchen", price: 34.99, stockQuantity: 10, minStockThreshold: 5 },
  ];

  const products: any[] = [];
  for (const prod of productData) {
    const category = categories.find(c => c.name === prod.categoryName);
    if (!category) continue;

    const existing = await prisma.product.findFirst({ where: { name: prod.name, userId: activeUserId } });
    if (existing) {
      products.push(existing);
      continue;
    }

    const status = prod.stockQuantity > 0 ? "ACTIVE" : "OUT_OF_STOCK";
    const created = await prisma.product.create({
      data: {
        name: prod.name,
        categoryId: category.id,
        price: prod.price,
        stockQuantity: prod.stockQuantity,
        minStockThreshold: prod.minStockThreshold,
        status: status as any,
        userId: activeUserId,
      },
    });
    products.push(created);

    await prisma.activityLog.create({
      data: {
        userId: activeUserId,
        type: "PRODUCT_ADDED",
        message: `Product "${prod.name}" added with ${prod.stockQuantity} units`,
        metadata: { productId: created.id },
      },
    });

    // Add low-stock items to restock queue
    if (prod.stockQuantity < prod.minStockThreshold) {
      const priority = prod.stockQuantity === 0 ? "HIGH" : prod.stockQuantity <= prod.minStockThreshold / 2 ? "MEDIUM" : "LOW";
      await prisma.restockQueue.upsert({
        where: { productId: created.id },
        create: { productId: created.id, userId: activeUserId, priority: priority as any },
        update: { priority: priority as any },
      });
    }
  }
  console.log(`   ✅ ${products.length} products ready`);

  // ==========================================
  // 4. Create Sample Orders
  // ==========================================
  console.log("\n🛒 Creating orders...");

  const orderData = [
    {
      customerName: "Alex Johnson",
      items: [
        { productName: "iPhone 13", quantity: 1 },
        { productName: "Sony WH-1000XM4 Headphones", quantity: 1 },
      ],
      status: "DELIVERED",
    },
    {
      customerName: "Sarah Williams",
      items: [
        { productName: "Premium Cotton T-Shirt", quantity: 3 },
        { productName: "Denim Jeans Slim Fit", quantity: 2 },
      ],
      status: "SHIPPED",
    },
    {
      customerName: "Michael Brown",
      items: [
        { productName: "Clean Code (Book)", quantity: 1 },
        { productName: "Design Patterns (Book)", quantity: 1 },
      ],
      status: "CONFIRMED",
    },
    {
      customerName: "Emily Davis",
      items: [
        { productName: "Organic Rice (5kg)", quantity: 2 },
        { productName: "Extra Virgin Olive Oil", quantity: 1 },
        { productName: "Whole Wheat Bread", quantity: 3 },
      ],
      status: "PENDING",
    },
    {
      customerName: "James Wilson",
      items: [
        { productName: "MacBook Pro 14\"", quantity: 1 },
      ],
      status: "PENDING",
    },
  ];

  // Check if orders already exist
  const existingOrderCount = await prisma.order.count({ where: { userId: activeUserId } });
  if (existingOrderCount > 0) {
    console.log(`   ⏭️  ${existingOrderCount} orders already exist. Skipping order creation.`);
  } else {
    for (const orderInfo of orderData) {
      const orderItems = orderInfo.items
        .map(item => {
          const product = products.find(p => p.name === item.productName);
          if (!product) return null;
          return {
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.price,
            subtotal: product.price * item.quantity,
          };
        })
        .filter(Boolean) as any[];

      if (orderItems.length === 0) continue;

      const totalPrice = orderItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);

      const order = await prisma.order.create({
        data: {
          customerName: orderInfo.customerName,
          totalPrice,
          status: orderInfo.status as any,
          userId: activeUserId,
          items: { create: orderItems },
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: activeUserId,
          type: "ORDER_CREATED",
          message: `Order #${order.orderNumber} created for "${orderInfo.customerName}" — $${totalPrice.toFixed(2)}`,
          metadata: { orderId: order.id, orderNumber: order.orderNumber },
        },
      });

      if (orderInfo.status !== "PENDING") {
        const activityType = orderInfo.status === "SHIPPED" ? "ORDER_SHIPPED" 
          : orderInfo.status === "DELIVERED" ? "ORDER_DELIVERED" 
          : "ORDER_UPDATED";
        
        await prisma.activityLog.create({
          data: {
            userId: activeUserId,
            type: activityType as any,
            message: `Order #${order.orderNumber} marked as ${orderInfo.status}`,
            metadata: { orderId: order.id, status: orderInfo.status },
          },
        });
      }
    }
    console.log(`   ✅ ${orderData.length} orders created`);
  }

  // ==========================================
  // 5. Summary
  // ==========================================
  const totalProducts = await prisma.product.count({ where: { userId: activeUserId } });
  const totalOrders = await prisma.order.count({ where: { userId: activeUserId } });
  const totalLogs = await prisma.activityLog.count({ where: { userId: activeUserId } });
  const restockCount = await prisma.restockQueue.count({ where: { userId: activeUserId } });

  console.log("\n" + "═".repeat(50));
  console.log("🎉 Seed completed successfully!\n");
  console.log(`📊 Summary:`);
  console.log(`   👤 Demo User: demo@orderstock.com / demo1234`);
  console.log(`   📁 Categories: ${categories.length}`);
  console.log(`   📦 Products: ${totalProducts}`);
  console.log(`   🛒 Orders: ${totalOrders}`);
  console.log(`   ⚠️  Restock Queue: ${restockCount}`);
  console.log(`   📝 Activity Logs: ${totalLogs}`);
  console.log("═".repeat(50));
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
