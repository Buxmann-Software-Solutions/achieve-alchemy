import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateHabit } from "@/hooks/habit/use-update-habit";

interface ToggleArchiveHabitButtonProps {
  habitId: string;
  isArchived: boolean;
}

export function ToggleArchiveHabitButton({
  habitId,
  isArchived,
}: ToggleArchiveHabitButtonProps) {
  const { mutateAsync: updateHabit } = useUpdateHabit();

  async function toggleArchived() {
    try {
      await updateHabit({
        id: habitId,
        isArchived: !isArchived,
        title: null,
        description: null,
        icon: null,
      });
      toast.success(
        `Habit succesfully ${!isArchived ? "archived!" : "restored!"}`,
        {
          icon: <CheckCircle size={16} />,
        }
      );
    } catch (error) {
      toast.warning("Something went wrong, please try again.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
      });
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleArchived}>
      {isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
    </Button>
  );
}
