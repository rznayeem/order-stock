import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationOptions<TData> = {
  mutationFn: (data: TData) => Promise<any>;
  invalidateKeys?: unknown[][];
  successMessage?: string;
  errorMessage?: string;
};

export function useAppMutation<TData>({ mutationFn, invalidateKeys = [], successMessage, errorMessage }: MutationOptions<TData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      if (successMessage) toast.success(successMessage);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || errorMessage || "Something went wrong");
    },
  });
}
