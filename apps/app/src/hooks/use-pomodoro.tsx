import { usePomodoro as usePomodoroContext } from "../contexts/PomodoroContext";
import { toast } from "sonner";
import { useCallback } from "react";

export function usePomodoro() {
  const context = usePomodoroContext();

  return {
    timeLeft: formatTime(context.timeLeft),
    startOrResumeTimer: context.startOrResumeTimer,
    pauseTimer: context.pauseTimer,
    stopTimer: context.stopTimer,
    abandonSession: context.stopTimer,
    restartSession: useCallback(() => {
      context.stopTimer();
      context.startOrResumeTimer();
    }, [context]),
    isPaused: context.isPaused,
    mode: context.mode,
    completedSessions: context.completedSessions,
    settings: context.settings,
    updateSettings: context.updateSettings,
  };
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
