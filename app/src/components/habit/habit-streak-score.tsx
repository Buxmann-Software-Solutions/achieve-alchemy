import { useGetHabitCompletionStreak } from "@/hooks/habit/use-get-habit-completion-streak";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface HabitStreakScoreProps {
  habitId: string;
}

export function HabitStreakScore({ habitId }: HabitStreakScoreProps) {
  const { data, isLoading, isError } = useGetHabitCompletionStreak({ habitId });

  if (isError) {
    return <div className="text-red-600 text-xs">Failed fetching streak</div>;
  }

  if (isLoading) {
    return <Skeleton className="w-9 h-9" />;
  }

  return (
    <div className="flex h-9 items-center space-x-[5px]">
      <Flame size={20} />
      <div className="text-md font-semibold">{data}</div>
    </div>
  );
}
