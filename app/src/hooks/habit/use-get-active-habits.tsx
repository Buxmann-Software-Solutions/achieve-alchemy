import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { taurpc } from "@/lib/taurpc";
import { useQuery } from "@tanstack/react-query";
import { habitsQueryKey } from "@/hooks/habit/use-add-habit";

export function useGetActiveHabits() {
  const query = useQuery({
    queryKey: habitsQueryKey,
    queryFn: async () => {
      return await taurpc.get_active_habits();
    },
  });

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
