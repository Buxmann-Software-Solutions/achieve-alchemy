import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroQueryKey } from "./use-get-current-cycle";

export function useUpdateCycleStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: {
      id: string;
      status: "COMPLETED" | "IN_PROGRESS" | "ABANDONED";
    }) => {
      return await taurpc.update_cycle_status(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pomodoroQueryKey });
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
