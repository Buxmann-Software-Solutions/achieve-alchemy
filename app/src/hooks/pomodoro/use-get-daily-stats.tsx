import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useQuery } from "@tanstack/react-query";

export function useGetDailyStats(date: string) {
  const query = useQuery({
    queryKey: ["pomodoro", "daily-stats", date],
    queryFn: async () => {
      return await taurpc.get_daily_stats(date);
    },
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
