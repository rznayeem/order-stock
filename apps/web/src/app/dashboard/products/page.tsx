import { headers } from "next/headers";
import { auth } from "@repo/database";
import { redirect } from "next/navigation";
import { ProductsView } from "@/components/products/ProductsView";
import { prisma } from "@repo/database";

export default async function ProductsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const userRole = (session.user as any).role || "USER";
  if (userRole !== "ADMIN" && userRole !== "MANAGER") {
    redirect("/dashboard");
  }

  // Fetch initial data on the server for faster initial load (LCP)
  const [initialProducts, initialCategories] = await Promise.all([
    prisma.product.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  // Sanitize data for the client (Prisma objects might have dates that need serialization)
  const serializedProducts = JSON.parse(JSON.stringify(initialProducts));
  const serializedCategories = JSON.parse(JSON.stringify(initialCategories));

  const initialData = {
    data: serializedProducts,
    meta: {
      total: await prisma.product.count({ where: { userId: session.user.id } }),
      page: 1,
      limit: 10,
      totalPage: Math.ceil((await prisma.product.count({ where: { userId: session.user.id } })) / 10),
    }
  };

  return (
    <ProductsView 
      userId={session.user.id} 
      initialProducts={initialData} 
      initialCategories={serializedCategories} 
    />
  );
}
