import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useOrders = (params: { userId?: string; search?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      if (!params.userId) return null;
      const searchParams = new URLSearchParams();
      if (params.userId) searchParams.append("userId", params.userId);
      if (params.search) searchParams.append("search", params.search);
      if (params.status && params.status !== "all") searchParams.append("status", params.status);
      if (params.dateFrom) searchParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) searchParams.append("dateTo", params.dateTo);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());

      const { data } = await axiosInstance.get(`/orders?${searchParams.toString()}`);
      return data;
    },
    enabled: !!params.userId,
    placeholderData: (prev) => prev,
  });
};
