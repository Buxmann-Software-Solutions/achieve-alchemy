import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function useGetDailyStats(date: string) {
  const query = trpc.pomodoro.getDailyStats.useQuery({
    date,
  });

  useEffect(() => {
    if (query.isError) {
      toast.warning("Failed to fetch daily stats.", {
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
