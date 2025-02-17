import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc, trpcQueryUtils } from "@/lib/trpc";

export function useCreateHabit() {
  return trpc.habit.create.useMutation({
    onSuccess: async () => {
      trpcQueryUtils.habit.getActive.invalidate();
      toast.success("Habit succesfully added!", {
        icon: <CheckCircle size={16} />,
      });
    },
    onError: () => {
      toast.warning("Something went wrong, please try again.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
      });
    },
  });
}
