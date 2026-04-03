import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useCategories = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await axiosInstance.get(`/categories?userId=${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
};
