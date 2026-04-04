import { QueryClient, dehydrate } from "@tanstack/react-query";
import { DAL } from "./data-fetching";

/**
 * Server-side utility to prefetch queries and return the dehydrated state.
 * This ensures the client-side React Query cache is hydrated with data from the server.
 */
export async function getDehydratedState(userId: string) {
  const queryClient = new QueryClient();

  // Define prefetch operations based on common keys
  // Note: These keys must MATCH the keys used in the useQuery hooks exactly.

  return {
    /**
     * Prefetch categories
     */
    async prefetchCategories() {
      await queryClient.prefetchQuery({
        queryKey: ["categories", userId],
        queryFn: () => DAL.getInitialCategories(userId),
      });
      return dehydrate(queryClient);
    },

    /**
     * Prefetch products
     */
    async prefetchProducts(limit = 10) {
      await queryClient.prefetchQuery({
        queryKey: ["products", { userId, search: "", status: "all", categoryId: "all", page: 1, limit }],
        queryFn: () => DAL.getInitialProducts(userId, limit),
      });
      return dehydrate(queryClient);
    },

    /**
     * Prefetch orders
     */
    async prefetchOrders(params: { search?: string; status?: string; dateFrom?: string; dateTo?: string; page: number; limit: number }) {
        // Build key that matches useOrders hook exactly
        const queryKey = ["orders", { userId, ...params }];
        await queryClient.prefetchQuery({
            queryKey,
            queryFn: () => DAL.getInitialOrders(userId, params.limit), // Note: DAL currently ignores advanced filters for initial fetch
        });
        return dehydrate(queryClient);
    },

    /**
     * Prefetch restock queue
     */
    async prefetchRestockQueue() {
      await queryClient.prefetchQuery({
        queryKey: ["restock-queue", userId],
        queryFn: () => DAL.getInitialRestockQueue(userId),
      });
      return dehydrate(queryClient);
    },

    /**
     * Prefetch users
     */
    async prefetchUsers(limit = 10) {
      await queryClient.prefetchQuery({
        queryKey: ["users", { search: "", role: "all", page: 1, limit }],
        queryFn: () => DAL.getInitialUsers(limit),
      });
      return dehydrate(queryClient);
    },

    /**
     * Prefetch activity logs
     */
    async prefetchActivityLogs(limit = 50) {
      await queryClient.prefetchQuery({
        queryKey: ["activity-logs", userId, limit],
        queryFn: () => DAL.getInitialActivityLogs(userId, limit),
      });
      return dehydrate(queryClient);
    },

    /**
     * Get the final dehydrated state
     */
    getDehydratedState() {
      return dehydrate(queryClient);
    }
  };
}
