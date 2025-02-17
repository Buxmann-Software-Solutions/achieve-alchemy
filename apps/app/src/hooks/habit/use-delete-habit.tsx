import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc, trpcQueryUtils } from "@/lib/trpc";

export function useDeleteHabit() {
  return trpc.habit.delete.useMutation({
    onSuccess: () => trpcQueryUtils.habit.getArchived.invalidate(),
    onError: () => {
      toast.warning("Something went wrong, please try again.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
      });
    },
  });
}
