import { headers } from "next/headers";
import { auth } from "@repo/database";
import { redirect } from "next/navigation";
import { ProductsView } from "@/components/products/ProductsView";
import { HydrationBoundary } from "@tanstack/react-query";
import { getDehydratedState } from "@/lib/query-prefetch";

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

  // Professional Hydration: Pre-populate the React Query cache on the server
  const prefetch = await getDehydratedState(session.user.id);
  // We prefetch both products and categories for the products page
  await prefetch.prefetchProducts(10);
  const dehydratedState = await prefetch.prefetchCategories();

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProductsView userId={session.user.id} />
    </HydrationBoundary>
  );
}
