import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useStartPomodoroCycle } from "@/hooks/pomodoro/use-start-pomodoro-cycle";
import { useStartSession } from "@/hooks/pomodoro/use-start-session";
import { useCompleteSession } from "@/hooks/pomodoro/use-complete-session";
import { useGetCurrentCycle } from "@/hooks/pomodoro/use-get-current-cycle";
import { useUpdateCycleStatus } from "@/hooks/pomodoro/use-update-cycle-status";

export enum PomodoroMode {
  FOCUS = "FOCUS",
  SHORT_BREAK = "SHORT_BREAK",
  LONG_BREAK = "LONG_BREAK",
}

// Pomodoro Settings
interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

// Timer State
interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  completedSessions: number;
  settings: PomodoroSettings;
  currentCycleId?: string;
  currentSessionId?: string;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25 * 60 * 1000, // 25 minutes in ms
  shortBreakDuration: 5 * 60 * 1000, // 5 minutes in ms
  longBreakDuration: 15 * 60 * 1000, // 15 minutes in ms
  sessionsUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
};

// Reducer Actions
type PomodoroAction =
  | { type: "START"; mode?: PomodoroMode }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "RESET" }
  | { type: "TICK" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<PomodoroSettings> }
  | { type: "SESSION_COMPLETE" }
  | { type: "SET_CYCLE_ID"; cycleId: string | undefined }
  | { type: "SET_SESSION_ID"; sessionId: string | undefined }
  | {
      type: "STOP_AND_RESET";
      payload: {
        cycleId: string | undefined;
        sessionId: string | undefined;
        isRunning: boolean;
        isPaused: boolean;
        mode: PomodoroMode;
        timeLeft: number;
      };
    };

// Reducer Function
function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction
): PomodoroState {
  switch (action.type) {
    case "START": {
      const mode = action.mode || state.mode;
      const duration =
        mode === PomodoroMode.FOCUS
          ? state.settings.focusDuration
          : mode === PomodoroMode.SHORT_BREAK
            ? state.settings.shortBreakDuration
            : state.settings.longBreakDuration;

      return {
        ...state,
        mode,
        isRunning: true,
        isPaused: false,
        timeLeft: duration,
      };
    }

    case "PAUSE":
      return { ...state, isPaused: true };

    case "RESUME":
      return { ...state, isPaused: false };

    case "STOP":
      return {
        ...state,
        isRunning: false,
        isPaused: false,
        mode: PomodoroMode.FOCUS,
        timeLeft: state.settings.focusDuration,
        currentCycleId: undefined,
        currentSessionId: undefined,
      };

    case "RESET":
      return { ...state, completedSessions: 0 };

    case "TICK":
      if (state.timeLeft <= 0) {
        return {
          ...state,
          isRunning: false,
          timeLeft: 0,
        };
      }
      return { ...state, timeLeft: state.timeLeft - 1000 };

    case "SESSION_COMPLETE": {
      let newMode = PomodoroMode.FOCUS;
      let newCompletedSessions = state.completedSessions;
      let shouldAutoStart = false;

      // Only handle focus and short break completions
      if (state.mode === PomodoroMode.FOCUS) {
        newCompletedSessions += 1;
        newMode =
          newCompletedSessions % state.settings.sessionsUntilLongBreak === 0
            ? PomodoroMode.LONG_BREAK
            : PomodoroMode.SHORT_BREAK;
        toast.success("Focus session completed! Time for a break! 🎉");
        shouldAutoStart = state.settings.autoStartBreaks;
      } else if (state.mode === PomodoroMode.SHORT_BREAK) {
        newMode = PomodoroMode.FOCUS;
        toast.success("Break completed! Time to focus! 💪");
        shouldAutoStart = state.settings.autoStartPomodoros;
      }

      const newDuration =
        newMode === PomodoroMode.FOCUS
          ? state.settings.focusDuration
          : newMode === PomodoroMode.SHORT_BREAK
            ? state.settings.shortBreakDuration
            : state.settings.longBreakDuration;

      return {
        ...state,
        mode: newMode,
        completedSessions: newCompletedSessions,
        isRunning: shouldAutoStart,
        isPaused: false,
        timeLeft: newDuration,
      };
    }

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case "SET_CYCLE_ID":
      return { ...state, currentCycleId: action.cycleId };

    case "SET_SESSION_ID":
      return { ...state, currentSessionId: action.sessionId };

    case "STOP_AND_RESET":
      return {
        ...state,
        isRunning: action.payload.isRunning,
        isPaused: action.payload.isPaused,
        mode: action.payload.mode,
        timeLeft: action.payload.timeLeft,
        currentCycleId: action.payload.cycleId,
        currentSessionId: action.payload.sessionId,
      };

    default:
      return state;
  }
}

// Create Context
const PomodoroContext = createContext<
  | {
      state: PomodoroState;
      dispatch: React.Dispatch<PomodoroAction>;
    }
  | undefined
>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pomodoroReducer, {
    mode: PomodoroMode.FOCUS,
    timeLeft: DEFAULT_SETTINGS.focusDuration,
    isRunning: false,
    isPaused: false,
    completedSessions: 0,
    settings: DEFAULT_SETTINGS,
  });

  const { mutateAsync: startPomodoroCycle } = useStartPomodoroCycle();
  const { mutateAsync: startSession } = useStartSession();
  const { mutateAsync: completeSession } = useCompleteSession();
  const { data: currentCycle } = useGetCurrentCycle();
  const { mutateAsync: updateCycleStatus } = useUpdateCycleStatus();

  // Effect to sync with backend state
  useEffect(() => {
    if (currentCycle) {
      dispatch({ type: "SET_CYCLE_ID", cycleId: currentCycle.id });
    }
  }, [currentCycle]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isRunning && !state.isPaused) {
      timer = setInterval(async () => {
        dispatch({ type: "TICK" });
        if (state.timeLeft <= 1000) {
          try {
            // First complete the current session if it exists
            if (state.currentSessionId) {
              await completeSession({
                sessionId: state.currentSessionId,
                wasCompleted: true,
              });
              dispatch({ type: "SET_SESSION_ID", sessionId: undefined });

              // Handle session completion based on mode
              if (state.mode === PomodoroMode.LONG_BREAK) {
                if (state.currentCycleId) {
                  await updateCycleStatus({
                    id: state.currentCycleId,
                    status: "COMPLETED",
                  });
                  // Stop everything immediately to prevent new session creation
                  dispatch({
                    type: "STOP_AND_RESET",
                    payload: {
                      cycleId: undefined,
                      sessionId: undefined,
                      isRunning: false,
                      isPaused: false,
                      mode: PomodoroMode.FOCUS,
                      timeLeft: state.settings.focusDuration,
                    },
                  });
                  toast.success(
                    "Pomodoro cycle completed! Great work today! 🎉"
                  );
                }
              } else {
                // For focus and short break sessions, continue to next session
                dispatch({ type: "SESSION_COMPLETE" });
              }
            }
          } catch (error) {
            console.error("Error completing session/cycle:", error);
            dispatch({ type: "STOP" });
            toast.error("Error completing session. Timer stopped.");
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [
    state.isRunning,
    state.isPaused,
    state.timeLeft,
    state.currentSessionId,
    state.mode,
    state.currentCycleId,
  ]);

  // Effect to start new cycle when needed
  useEffect(() => {
    async function startCycle() {
      if (state.isRunning && !state.currentCycleId) {
        try {
          console.log("Starting new cycle with settings:", {
            focusDuration: state.settings.focusDuration,
            shortBreakDuration: state.settings.shortBreakDuration,
            longBreakDuration: state.settings.longBreakDuration,
            sessionsUntilLongBreak: state.settings.sessionsUntilLongBreak,
            autoStartBreaks: state.settings.autoStartBreaks,
            autoStartPomodoros: state.settings.autoStartPomodoros,
          });

          const cycle = await startPomodoroCycle({
            focusDuration: state.settings.focusDuration,
            shortBreakDuration: state.settings.shortBreakDuration,
            longBreakDuration: state.settings.longBreakDuration,
            sessionsUntilLongBreak: state.settings.sessionsUntilLongBreak,
            autoStartBreaks: state.settings.autoStartBreaks,
            autoStartPomodoros: state.settings.autoStartPomodoros,
          });

          console.log("Cycle created:", cycle);

          if (cycle && cycle.id) {
            dispatch({ type: "SET_CYCLE_ID", cycleId: cycle.id });
          } else {
            throw new Error("Cycle created but no ID returned");
          }
        } catch (error) {
          console.error("Failed to start cycle:", error);
          toast.error("Failed to start pomodoro cycle. Timer stopped.");
          dispatch({ type: "STOP" });
        }
      }
    }
    startCycle();
  }, [state.isRunning, state.currentCycleId, state.settings]);

  // Effect to start new session when needed
  useEffect(() => {
    async function startNewSession() {
      // Don't create new sessions if we're not running or if we're in a completed state
      if (!state.isRunning || !state.currentCycleId || state.currentSessionId) {
        return;
      }

      // For long breaks, only create a session if we've completed exactly the required number of sessions
      if (
        state.mode === PomodoroMode.LONG_BREAK &&
        state.completedSessions !== state.settings.sessionsUntilLongBreak
      ) {
        return;
      }

      const sessionType =
        state.mode === PomodoroMode.FOCUS
          ? "FOCUS"
          : state.mode === PomodoroMode.SHORT_BREAK
            ? "SHORT_BREAK"
            : "LONG_BREAK";

      const durationMinutes = Math.floor(state.timeLeft / (60 * 1000));

      try {
        console.log("Starting new session with:", {
          cycleId: state.currentCycleId,
          sessionType,
          durationMinutes,
          completedSessions: state.completedSessions,
          sessionsUntilLongBreak: state.settings.sessionsUntilLongBreak,
        });

        const session = await startSession({
          cycleId: state.currentCycleId,
          sessionType,
          durationMinutes,
        });

        console.log("Session created:", session);

        if (session && session.id) {
          dispatch({ type: "SET_SESSION_ID", sessionId: session.id });
        } else {
          throw new Error("Session created but no ID returned");
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        dispatch({ type: "STOP" });
        toast.error("Failed to start session. Timer stopped.");
      }
    }
    startNewSession();
  }, [
    state.isRunning,
    state.currentCycleId,
    state.currentSessionId,
    state.mode,
    state.timeLeft,
    state.completedSessions,
    state.settings.sessionsUntilLongBreak,
  ]);

  return (
    <PomodoroContext.Provider value={{ state, dispatch }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
