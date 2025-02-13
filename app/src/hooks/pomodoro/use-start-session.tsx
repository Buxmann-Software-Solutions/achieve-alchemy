import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroQueryKey } from "./use-get-current-cycle";

export function useStartSession() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: {
      cycleId: string;
      sessionType: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";
      durationMinutes: number;
    }) => {
      return await taurpc.start_session(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pomodoroQueryKey });
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
