import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitsQueryKey } from "@/hooks/habit/use-add-habit";

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (habitId: string) => {
      return await taurpc.delete_habit(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitsQueryKey });
    },
    onError: () => {
      toast.warning("Something went wrong, please try again.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
      });
    },
  });

  return mutation;
}
