import { Check } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { cn } from "@/lib/utils";
import { useGetHabitCompletions } from "@/hooks/habit/use-get-habit-completions";
import { isSameDay } from "date-fns";
import { useToggleHabitCompletion } from "@/hooks/use-toggle-habit-completion";

interface AddHabitCompletionButtonProps {
  habitId: string;
}

export function ToggleHabitCompletionButton({
  habitId,
}: AddHabitCompletionButtonProps) {
  const { data, isLoading } = useGetHabitCompletions({
    habitId: habitId.toString(),
  });
  const { mutateAsync: toggleHabitCompletion, isPending } =
    useToggleHabitCompletion();
  const todaysHabitCompletion = data?.find((habitCompletion) =>
    isSameDay(habitCompletion.createdAt, new Date())
  );
  const isCompletedState = Boolean(todaysHabitCompletion);

  return (
    <AnimatedButton
      isDisabled={isPending || isLoading}
      isCompletedState={isCompletedState}
      onClick={async () => {
        await toggleHabitCompletion({
          id: todaysHabitCompletion ? todaysHabitCompletion.id : null,
          habitId,
          createdAt: null,
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
