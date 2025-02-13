import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, TimerOff, TimerReset } from "lucide-react";
import { PageLayout } from "@/components/layouts/page-layout";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Button } from "@/components/ui/button";
import { EditPomodoroPreferencesButton } from "@/components/edit-pomodoro-preferences-button";

export const Route = createFileRoute("/pomodoro")({
  component: PomodoroComponent,
});

function PomodoroComponent() {
  return (
    <PageLayout title="Pomodoro" subTitle="Harness time, enhance focus">
      <Pomodoro />
    </PageLayout>
  );
}

function Pomodoro() {
  const {
    mode,
    timeLeft,
    startOrResumeTimer,
    pauseTimer,
    isPaused,
    abandonSession,
    completedSessions,
    restartSession,
    settings,
  } = usePomodoro();

  return (
    <div className="h-full flex flex-col">
      <div className="relative flex flex-1 justify-center">
        <div className="absolute top-[30%] flex flex-col items-center space-y-4">
          <div className="text-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {mode}
            </h3>
            <h1 className="scroll-m-20 text-9xl font-extrabold lg:text-8xl">
              {timeLeft}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={restartSession}
              title="Restart session"
            >
              <TimerReset />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => (isPaused ? startOrResumeTimer() : pauseTimer())}
              title={isPaused ? "Start timer" : "Pause timer"}
            >
              {isPaused ? <Play /> : <Pause />}
            </Button>
            <EditPomodoroPreferencesButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={abandonSession}
              title="Abandon session"
            >
              <TimerOff />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-tight">
            Sessions Progress
          </h3>
          <p className="text-sm text-muted-foreground">
            {completedSessions} / {settings.sessionsUntilLongBreak} until long
            break
          </p>
        </div>
        <SessionStats />
      </div>
    </div>
  );
}

function SessionStats() {
  const { dailyFocusMinutes } = usePomodoro();

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xl font-semibold tracking-tight">
        Today's Focus Time
      </h3>
      <p className="text-sm text-muted-foreground text-right">
        {dailyFocusMinutes} minutes
      </p>
    </div>
  );
}
