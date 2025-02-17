import { trpc } from "@/lib/trpc";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export function useGetArchivedHabits() {
  const query = trpc.habit.getArchived.useQuery();

  useEffect(() => {
    if (query.isError) {
      toast.warning("Uh oh! Something went wrong.", {
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
