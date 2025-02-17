import { Check } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { cn } from "@/lib/utils";
import { useGetCompletions } from "@/hooks/habit/use-get-completions";
import { isSameDay } from "date-fns";
import { useToggleCompletion } from "@/hooks/habit/use-toggle-completion";

interface AddHabitCompletionButtonProps {
  habitId: string;
}

export function ToggleHabitCompletionButton({
  habitId,
}: AddHabitCompletionButtonProps) {
  const { data, isLoading } = useGetCompletions({
    habitId: habitId.toString(),
  });
  const { mutateAsync: toggleCompletion, isPending } = useToggleCompletion();
  const todaysHabitCompletion = data?.find((habitCompletion) =>
    isSameDay(habitCompletion.createdAt, new Date())
  );
  const isCompletedState = Boolean(todaysHabitCompletion);

  return (
    <AnimatedButton
      isDisabled={isPending || isLoading}
      isCompletedState={isCompletedState}
      onClick={async () => {
        await toggleCompletion({
          id: todaysHabitCompletion ? todaysHabitCompletion.id : undefined,
          habitId,
          createdAt: undefined,
        });
      }}
    >
      <Check
        size={20}
        className={cn("z-[5]", {
          "!text-background": isCompletedState,
        })}
      />
    </AnimatedButton>
  );
}
