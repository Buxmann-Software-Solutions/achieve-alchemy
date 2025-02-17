import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { trpc, trpcQueryUtils } from "@/lib/trpc";

export function useStartSession() {
  const mutation = trpc.pomodoro.startSession.useMutation({
    onSuccess: () => {
      trpcQueryUtils.pomodoro.getCurrentCycle.invalidate();
    },
  });

  useEffect(() => {
    if (mutation.isError) {
      toast.warning("Failed to start session.", {
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
