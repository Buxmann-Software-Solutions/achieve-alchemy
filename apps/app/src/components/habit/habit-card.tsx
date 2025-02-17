import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "@/components/lucide-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EditHabitButton } from "@/components/habit/edit-habit-button";
import { ToggleArchiveHabitButton } from "@/components/habit/toggle-archive-habit-button";
import { ToggleHabitCompletionButton } from "@/components/habit/toggle-habit-completion-button";
import { HabitStreak } from "@/components/habit/habit-streak";
import { useDimensions } from "@/hooks/use-dimensions";
import { HabitStreakScore } from "@/components/habit/habit-streak-score";
import { DeleteHabitButton } from "@/components/habit/delete-habit-button";
import { useRef } from "react";
import { routerOutput } from "@/lib/trpc";

interface HabitCardProps {
  habit: routerOutput["habit"]["getActive"][number];
}

export const HabitCard = ({ habit }: HabitCardProps) => {
  const { id, title, description, icon, isArchived } = habit;
  const ref = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(ref);

  return (
    <Card
      className={cn("flex-1", {
        "opacity-70 hover:opacity-100": isArchived,
      })}
    >
      <div className="w-full">
        <div className="px-6 flex items-start justify-between space-x-5">
          <CardHeader className="w-full px-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <LucideIcon
            name={icon as any}
            size={24}
            className="min-w-[24px] my-6"
          />
        </div>
        <CardContent>
          <div ref={ref}>
            <HabitStreak width={dimensions.width} habitId={habit.id} />
          </div>
        </CardContent>
      </div>
      <CardFooter>
        <div className="flex w-full items-center justify-between space-x-[5px]">
          <HabitStreakScore habitId={habit.id} />
          <div className="flex items-center space-x-1">
            <ToggleArchiveHabitButton habitId={id} isArchived={isArchived} />
            {isArchived ? (
              <DeleteHabitButton habitId={habit.id} />
            ) : (
              <>
                <EditHabitButton habit={habit} />
                <ToggleHabitCompletionButton habitId={id} />
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export function LoadingHabitCard() {
  return (
    <Card className="flex-1">
      <div className="w-full">
        <div className="px-6 flex items-start justify-between space-x-5">
          <CardHeader className="w-full px-0">
            <Skeleton className="w-[200px] h-[20px]" />
            <Skeleton className="w-[250px] h-[20px]" />
          </CardHeader>
          <Skeleton className="w-[30px] h-[30px] my-6" />
        </div>
        <CardContent>
          <Skeleton className="w-full h-[131px]" />
        </CardContent>
      </div>
      <CardFooter>
        <div className="flex w-full items-center justify-between space-x-[5px]">
          <Skeleton className="w-9 h-9" />
          <div className="flex items-center space-x-1">
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-9 h-9" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
