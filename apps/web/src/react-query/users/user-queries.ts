import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useUsers = (params: { search?: string; role?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append("search", params.search);
      if (params.role && params.role !== "all") searchParams.append("role", params.role);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());

      const { data } = await axiosInstance.get(`/users?${searchParams.toString()}`);
      return data;
    },
    placeholderData: (prev) => prev,
  });
};
