import { headers } from "next/headers";
import { auth } from "@repo/database";
import { redirect } from "next/navigation";
import { ActivityView } from "@/components/activity/ActivityView";
import { HydrationBoundary } from "@tanstack/react-query";
import { getDehydratedState } from "@/lib/query-prefetch";

export default async function ActivityLogPage() {
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
  const dehydratedState = await prefetch.prefetchActivityLogs(50);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ActivityView userId={session.user.id} />
    </HydrationBoundary>
  );
}
