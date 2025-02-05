import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taurpc } from "@/lib/taurpc";
import { habitCompletionsQueryKey } from "@/hooks/habit/use-get-habit-completions";
import { habitCompletionStreakQueryKey } from "@/hooks/habit/use-get-habit-completion-streak";
import { CreateHabitCompletionArgs } from "@/bindings";

export function useToggleHabitCompletion() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (habitCompletion: CreateHabitCompletionArgs) => {
      return await taurpc.toggle_habit_completion({
        id: habitCompletion.id ?? null,
        habitId: habitCompletion.habitId,
        createdAt: habitCompletion.createdAt,
      });
    },
    onSuccess: async (_, habitCompletion) => {
      await queryClient.invalidateQueries({
        queryKey: habitCompletionsQueryKey(habitCompletion.habitId),
      });
      await queryClient.invalidateQueries({
        queryKey: habitCompletionStreakQueryKey(habitCompletion.habitId),
      });
      toast.success("Habit succesfully updated!", {
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
