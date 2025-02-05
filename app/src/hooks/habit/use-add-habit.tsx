import { CreateHabitArgs } from "@/bindings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taurpc } from "@/lib/taurpc";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const habitsQueryKey = ["habits"];

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (createHabit: CreateHabitArgs) => {
      return await taurpc.create_habit(createHabit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitsQueryKey });
      toast.success("Habit succesfully added!", {
        icon: <CheckCircle size={16} />,
      });
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
