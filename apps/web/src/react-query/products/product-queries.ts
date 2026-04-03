import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useProducts = (params: { userId?: string; search?: string; categoryId?: string; status?: string; sort?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      if (!params.userId) return null;
      const searchParams = new URLSearchParams();
      if (params.userId) searchParams.append("userId", params.userId);
      if (params.search) searchParams.append("search", params.search);
      if (params.categoryId && params.categoryId !== "all") searchParams.append("categoryId", params.categoryId);
      if (params.status && params.status !== "all") searchParams.append("status", params.status);
      if (params.sort) searchParams.append("sort", params.sort);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());

      const { data } = await axiosInstance.get(`/products?${searchParams.toString()}`);
      return data;
    },
    enabled: !!params.userId,
    placeholderData: (prev) => prev,
  });
};
