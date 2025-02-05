import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useQuery } from "@tanstack/react-query";

interface useGetHabitCompletionStreakProps {
  habitId: string;
}

export const habitCompletionStreakQueryKey = (habitId: string) => [
  "habitCompletionStreak",
  habitId,
];

export function useGetHabitCompletionStreak({
  habitId,
}: useGetHabitCompletionStreakProps) {
  const query = useQuery({
    queryKey: habitCompletionStreakQueryKey(habitId),
    queryFn: async () => await taurpc.get_habit_completion_streak(habitId),
  });

  useEffect(() => {
    if (query.isError) {
      toast.warning("Uh oh! Something went wrong.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
        action: {
          label: "Try again",
          onClick: () => query.refetch(),
        },
      });
    }
  }, [query.isError]);

  return query;
}
