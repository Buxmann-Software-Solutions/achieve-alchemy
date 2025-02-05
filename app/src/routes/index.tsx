import { PageLayout } from "@/components/layouts/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import {
  Brain,
  Check,
  Clock,
  Dribbble,
  Eye,
  LucideIcon,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <PageLayout title="Dashboard" subTitle="Metrics that matter">
      <div className="h-[85vh] w-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-4">
          <OverviewRow />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <TodayHabits />
            <FocusGraph />
          </div>
          {/* <RecentNotes /> */}
        </div>
      </div>
    </PageLayout>
  );
}

// export function RecentNotes() {
//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {[].map((note) => (
//         <Card key={note.title} className="flex flex-col">
//           <CardHeader>
//             <div className="flex flex-row items-center justify-between space-x-2">
//               <CardTitle className="!text-md !font-semibold truncate">
//                 {note.title}
//               </CardTitle>
//               <Button variant="ghost" className="flex items-center space-x-1">
//                 <small className="text-xs font-medium leading-none">
//                   {note.wordCount}
//                 </small>
//                 <PenLine size={16} />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="flex flex-1 text-sm text-muted-foreground">
//             {note.body}
//           </CardContent>
//           <CardFooter className="flex items-center justify-between space-x-[10px]">
//             <div className="flex items-center space-x-1">
//               {note.tags.slice(0, 3).map((tag) => (
//                 <Badge key={tag} variant="outline" className="w-fit">
//                   {tag}
//                 </Badge>
//               ))}
//             </div>
//             <div className="flex items-center space-x-1">
//               <small className="text-xs font-medium leading-none">
//                 {format(note.createdAt, "MMM dd, yyyy")}
//               </small>
//               <CalendarDays size={16} />
//             </div>
//           </CardFooter>
//         </Card>
//       ))}
//     </div>
//   );
// }

function OverviewRow() {
  const stats = [
    {
      id: 1,
      icon: Clock,
      title: "Total Pomodoro Sessions",
      value: "25",
      change: "+18.1%",
    },
    {
      id: 2,
      icon: Target,
      title: "Total Focus Time",
      value: "17:08",
      change: "+20.1%",
    },
    {
      id: 3,
      icon: Brain,
      title: "Average Focus Duration",
      value: "00:41",
      change: "+9%",
    },
    {
      id: 4,
      icon: Dribbble,
      title: "Total Habits",
      value: "93",
      change: "+19%",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TodayHabits() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Habits For Today</CardTitle>
        <CardDescription>You have 5 habits due today.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-7">
          {/* {habits.map((habit) => (
            <HabitRow key={habit.id} {...habit} />
          ))} */}
        </div>
      </CardContent>
    </Card>
  );
}

interface HabitRowProps {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isCompleted: boolean;
  isArchived: boolean;
}

function HabitRow({
  id,
  icon: Icon,
  title,
  description,
  isCompleted,
  isArchived,
}: HabitRowProps) {
  const [isCompletedState, setIsCompletedState] = useState(false);

  return (
    <div
      className={cn("flex h-full items-center justify-between", {
        "opacity-70 hover:opacity-100": isCompletedState,
      })}
    >
      <div className="flex items-center">
        <Icon size={20} className="text-foreground" />
        <div className="ml-3">
          <h3 className="leading-none tracking-tight text-sm font-medium">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Eye size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setIsCompletedState(!isCompletedState)}
        >
          <Check
            size={20}
            className={cn("z-[5]", {
              "!text-background": isCompletedState,
            })}
          />
          <AnimatePresence>
            {isCompletedState && (
              <motion.span
                className="absolute inset-0 rounded-md bg-primary z-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              ></motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}

const data = [
  {
    average: 400,
    today: 240,
  },
  {
    average: 300,
    today: 139,
  },
  {
    average: 200,
    today: 980,
  },
  {
    average: 278,
    today: 390,
  },
  {
    average: 189,
    today: 480,
  },
  {
    average: 239,
    today: 380,
  },
  {
    average: 349,
    today: 430,
  },
];

export function FocusGraph() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Focus Minutes</CardTitle>
        <CardDescription>
          Your focus minutes are ahead of where you normally are.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Average
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Today
                            </span>
                            <span className="font-bold">
                              {payload[1].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="average"
                activeDot={{
                  r: 6,
                  style: { fill: "var(--theme-primary)", opacity: 0.25 },
                }}
                style={
                  {
                    opacity: 0.25,
                    stroke: "hsl(var(--foreground))",
                  } as React.CSSProperties
                }
              />
              <Line
                type="monotone"
                dataKey="today"
                strokeWidth={2}
                activeDot={{
                  r: 8,
                  style: { fill: "var(--theme-primary)" },
                }}
                style={
                  {
                    stroke: "hsl(var(--foreground))",
                  } as React.CSSProperties
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
