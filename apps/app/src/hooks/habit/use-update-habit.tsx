import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { trpc, trpcQueryUtils } from "@/lib/trpc";

export function useUpdateHabit() {
  const mutation = trpc.habit.update.useMutation({
    onSuccess: () => {
      trpcQueryUtils.habit.getActive.invalidate();
      trpcQueryUtils.habit.getArchived.invalidate();
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
