import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface useGetStreakProps {
  habitId: string;
}

export function useGetStreak({ habitId }: useGetStreakProps) {
  const query = trpc.habit.getStreak.useQuery({
    habitId,
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
