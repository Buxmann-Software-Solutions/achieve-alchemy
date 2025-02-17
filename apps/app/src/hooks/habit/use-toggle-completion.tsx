import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc, trpcQueryUtils } from "@/lib/trpc";

export function useToggleCompletion() {
  const mutation = trpc.habit.toggleCompletion.useMutation({
    onSuccess: () => {
      trpcQueryUtils.habit.getStreak.invalidate();
      trpcQueryUtils.habit.getCompletions.invalidate();
    },
    onError: () => {
      toast.warning("Something went wrong, please try again.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
      });
    },
  });

  return mutation;
}
