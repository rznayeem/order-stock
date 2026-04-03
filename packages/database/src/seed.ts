import { prisma } from "./prisma";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create demo user (password will be set through better-auth signup)
  console.log("📦 Creating demo categories...");

  // Note: In production, categories and products are created through the app
  // This seed is for development convenience only

  console.log("✅ Seed completed!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
