import { UpdateHabitArgs } from "@/bindings";
import { taurpc } from "@/lib/taurpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitsQueryKey } from "./use-add-habit";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updateHabit: UpdateHabitArgs) => {
      return await taurpc.update_habit(updateHabit);
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
