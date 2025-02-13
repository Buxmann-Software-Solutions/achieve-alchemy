import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useQuery } from "@tanstack/react-query";

export const pomodoroQueryKey = ["pomodoro"] as const;

export function useGetCurrentCycle() {
  const query = useQuery({
    queryKey: pomodoroQueryKey,
    queryFn: async () => {
      return await taurpc.get_current_cycle();
    },
  });

  useEffect(() => {
    if (query.isError) {
      toast.warning("Failed to fetch current pomodoro cycle.", {
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
