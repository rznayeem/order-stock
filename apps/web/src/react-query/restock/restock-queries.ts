import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useRestockQueue = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["restock-queue", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await axiosInstance.get(`/restock-queue?userId=${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
};
