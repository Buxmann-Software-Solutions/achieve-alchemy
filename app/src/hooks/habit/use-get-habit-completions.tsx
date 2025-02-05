import { taurpc } from "@/lib/taurpc";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface useGetHabitCompletionsProps {
  habitId: string;
}

export const habitCompletionsQueryKey = (habitId: string) => [
  "habitCompletions",
  habitId,
];

export function useGetHabitCompletions({
  habitId,
}: useGetHabitCompletionsProps) {
  const query = useQuery({
    queryKey: habitCompletionsQueryKey(habitId),
    queryFn: () =>
      taurpc.get_habit_completions({
        habitId: habitId,
        limit: null,
      }),
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
