import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useDashboardStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["dashboard-stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await axiosInstance.get(`/dashboard?userId=${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
};
