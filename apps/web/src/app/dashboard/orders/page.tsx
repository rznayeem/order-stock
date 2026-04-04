import { headers } from "next/headers";
import { auth } from "@repo/database";
import { redirect } from "next/navigation";
import { OrdersView } from "@/components/orders/OrdersView";
import { HydrationBoundary } from "@tanstack/react-query";
import { getDehydratedState } from "@/lib/query-prefetch";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Professional Hydration: Pre-populate the React Query cache on the server
  const prefetch = await getDehydratedState(session.user.id);
  // We prefetch orders (first page) and all products for the creation sheet
  await prefetch.prefetchOrders({ page: 1, limit: 10 });
  const dehydratedState = await prefetch.prefetchProducts(1000);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OrdersView userId={session.user.id} />
    </HydrationBoundary>
  );
}
