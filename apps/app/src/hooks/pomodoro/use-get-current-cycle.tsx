import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { routerOutput, trpc } from "@/lib/trpc";

export type PomodoroCycle = routerOutput["pomodoro"]["getCurrentCycle"];

export function useGetCurrentCycle() {
  const query = trpc.pomodoro.getCurrentCycle.useQuery();

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
