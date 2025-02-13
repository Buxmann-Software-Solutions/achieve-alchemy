import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useMutation } from "@tanstack/react-query";

export function useStartPomodoroCycle() {
  const mutation = useMutation({
    mutationFn: async (args: {
      focusDuration: number;
      shortBreakDuration: number;
      longBreakDuration: number;
      sessionsUntilLongBreak: number;
      autoStartBreaks: boolean;
      autoStartPomodoros: boolean;
    }) => {
      return await taurpc.start_pomodoro_cycle(args);
    },
  });

  useEffect(() => {
    if (mutation.isError) {
      toast.warning("Failed to start pomodoro cycle.", {
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
