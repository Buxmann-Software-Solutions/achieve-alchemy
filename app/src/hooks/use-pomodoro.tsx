import {
  usePomodoro as usePomodoroContext,
  PomodoroMode,
} from "../contexts/PomodoroContext";
import { toast } from "sonner";
import { useCallback } from "react";
import { useUpdateCycleStatus } from "./pomodoro/use-update-cycle-status";
import { useGetDailyStats } from "./pomodoro/use-get-daily-stats";

export function usePomodoro() {
  const { state, dispatch } = usePomodoroContext();
  const {
    timeLeft,
    isRunning,
    isPaused,
    mode,
    completedSessions,
    settings,
    currentCycleId,
  } = state;
  const { mutateAsync: updateCycleStatus } = useUpdateCycleStatus();
  const today = new Date().toISOString().split("T")[0];
  const { data: dailyStats } = useGetDailyStats(today);

  /**
   * Starts or resumes the timer
   */
  const startOrResumeTimer = useCallback(() => {
    if (isPaused) {
      dispatch({ type: "RESUME" });
      toast.success("Timer resumed");
    } else if (!isRunning) {
      dispatch({ type: "START" });
      toast.success("Pomodoro session started!");
    }
  }, [isRunning, isPaused, dispatch]);

  /**
   * Stops the current session
   */
  const abandonSession = useCallback(async () => {
    if (currentCycleId) {
      await updateCycleStatus({
        id: currentCycleId,
        status: "ABANDONED",
      });
    }
    dispatch({ type: "STOP" });
    toast.success("Session abandoned");
  }, [currentCycleId, dispatch, updateCycleStatus]);

  /**
   * Restarts the session from the beginning
   */
  const restartSession = useCallback(async () => {
    if (currentCycleId) {
      await updateCycleStatus({
        id: currentCycleId,
        status: "ABANDONED",
      });
    }
    dispatch({ type: "START", mode });
    toast.success("Session restarted");
  }, [mode, currentCycleId, dispatch, updateCycleStatus]);

  return {
    timeLeft: formatTime(timeLeft),
    startOrResumeTimer,
    pauseTimer: () => dispatch({ type: "PAUSE" }),
    abandonSession,
    isPaused: isPaused || !isRunning,
    mode: formatMode(mode),
    completedSessions,
    restartSession,
    settings,
    dailyFocusMinutes: dailyStats ?? 0,
  };
}

/**
 * Converts Pomodoro mode enum to a readable string
 */
function formatMode(mode: PomodoroMode): string {
  return (
    {
      [PomodoroMode.FOCUS]: "Focus",
      [PomodoroMode.SHORT_BREAK]: "Short Break",
      [PomodoroMode.LONG_BREAK]: "Long Break",
    }[mode] || "Unknown"
  );
}

/**
 * Formats time in milliseconds to MM:SS format
 */
export function formatTime(totalMilliseconds: number): string {
  if (isNaN(totalMilliseconds) || totalMilliseconds <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
