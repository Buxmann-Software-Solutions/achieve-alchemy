import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { trpc, trpcQueryUtils } from "@/lib/trpc";

export function useUpdateCycleStatus() {
  const mutation = trpc.pomodoro.updateCycleStatus.useMutation({
    onSuccess: () => {
      trpcQueryUtils.pomodoro.getCurrentCycle.invalidate();
    },
  });

  useEffect(() => {
    if (mutation.isError) {
      toast.warning("Failed to update cycle status.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
        action: {
          label: "Try again",
          onClick: () => mutation.reset(),
        },
      });
    }
  }, [mutation.isError]);

  return mutation;
}
