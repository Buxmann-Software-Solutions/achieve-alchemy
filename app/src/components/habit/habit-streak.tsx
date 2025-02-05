import { useToggleHabitCompletion } from "@/hooks/use-toggle-habit-completion";
import { useGetHabitCompletions } from "@/hooks/habit/use-get-habit-completions";
import { useTheme } from "@/providers/theme-provider";
import HeatMap, { HeatMapValue } from "@uiw/react-heat-map";
import {
  endOfDay,
  endOfWeek,
  format,
  formatISO,
  isSameDay,
  subWeeks,
} from "date-fns";
import { toast } from "sonner";
import { HabitCompletion } from "@/bindings";

interface StreakProps {
  width: number;
  habitId: string;
}

const HEATMAP_SPACE = 4;
const HEATMAP_RECT_SIZE = 15;

export function HabitStreak({ habitId, width }: StreakProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const numberOfWeeks = Math.floor(width / (HEATMAP_RECT_SIZE + HEATMAP_SPACE));
  const { data: habitCompletionsData } = useGetHabitCompletions({
    habitId: habitId,
  });
  const { mutateAsync: toggleHabitCompletion } = useToggleHabitCompletion();

  const heatmapProps = getHeatmapData({
    numberOfWeeks,
    data: habitCompletionsData ?? [],
  });

  return (
    <HeatMap
      width={width}
      height={150}
      space={HEATMAP_SPACE}
      rectSize={HEATMAP_RECT_SIZE}
      legendCellSize={0}
      style={{
        color: isDarkMode ? "#fff" : "#000",
        // @ts-ignore
        "--rhm-rect-hover-stroke": isDarkMode ? "#fff" : "#000",
        "--rhm-rect-active": isDarkMode ? "#fff" : "#000",
      }}
      weekLabels={false}
      rectProps={{
        rx: 4,
      }}
      panelColors={{
        0: isDarkMode ? "#000" : "#fff",
        1: isDarkMode ? "#fff" : "#000",
      }}
      rectRender={(props, data) => {
        const isInFuture = new Date(data.date) > endOfDay(new Date());

        return (
          <rect
            onClick={async () => {
              if (isInFuture) {
                toast("You can't complete a habit in the future");
                return;
              }

              const habitCompletionId = data?.content as string | undefined;
              await toggleHabitCompletion({
                id: habitCompletionId ?? null,
                habitId,
                createdAt: formatISO(data.date, {
                  representation: "date",
                }),
              });
            }}
            {...props}
            stroke={isDarkMode ? "#fff" : "#000"}
            opacity={isInFuture ? 0.2 : 1}
          />
        );
      }}
      {...heatmapProps}
    />
  );
}

interface GetHeatMapDataProps {
  numberOfWeeks: number;
  data: HabitCompletion[];
}

function getHeatmapData({ numberOfWeeks, data }: GetHeatMapDataProps): {
  startDate: Date;
  endDate: Date;
  value: HeatMapValue[];
} {
  const habitCompletionMap: Record<
    string,
    {
      count: number;
      id: number;
    }
  > = {};

  data.forEach((item: any) => {
    const date = format(new Date(item.createdAt), "yyyy/MM/dd");

    if (habitCompletionMap[date]) {
      habitCompletionMap[date] = {
        count: habitCompletionMap[date].count + 1,
        id: item.id,
      };
    } else {
      habitCompletionMap[date] = {
        count: 1,
        id: item.id,
      };
    }
  });

  // Convert the countMap to the desired array format
  const value = Object.keys(habitCompletionMap)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((date) => ({
      date: date,
      count: habitCompletionMap[date].count,
      content: habitCompletionMap[date].id,
    }));

  const endDate = endOfWeek(new Date(), { weekStartsOn: 0 });
  const startDate = subWeeks(endDate, numberOfWeeks - 1);

  return {
    startDate,
    endDate,
    value: value,
  };
}
