import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useActivityLogs = (userId: string | undefined, limit = 50) => {
  return useQuery({
    queryKey: ["activity-logs", userId, limit],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await axiosInstance.get(`/activity-logs?userId=${userId}&limit=${limit}`);
      return data.data;
    },
    enabled: !!userId,
  });
};
