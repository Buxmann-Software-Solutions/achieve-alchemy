import { createContext, useContext, useCallback, ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { toast } from "sonner";
import { PomodoroEvent, PomodoroState } from "../machines/PomodoroMachine";
import { pomodoroMachine } from "../machines/PomodoroMachine";

export enum PomodoroMode {
  FOCUS = "FOCUS",
  SHORT_BREAK = "SHORT_BREAK",
  LONG_BREAK = "LONG_BREAK",
}

// Create Context
const PomodoroContext = createContext<
  | {
      state: PomodoroState;
      send: (event: PomodoroEvent) => void;
    }
  | undefined
>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, send] = useMachine(pomodoroMachine);

  return (
    <PomodoroContext.Provider
      value={{
        state,
        send,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }

  const { state, send } = context;

  const startOrResumeTimer = useCallback(() => {
    if (state.matches("paused")) {
      send({ type: "RESUME" });
      toast.success("Timer resumed");
    } else if (state.matches("idle")) {
      send({ type: "START" });
      toast.success("Pomodoro session started!");
    }
  }, [state, send]);

  const pauseTimer = useCallback(() => {
    send({ type: "PAUSE" });
  }, [send]);

  const stopTimer = useCallback(() => {
    send({ type: "STOP" });
    toast.success("Session abandoned");
  }, [send]);

  const updateSettings = useCallback(
    (settings: Partial<PomodoroState["context"]["settings"]>) => {
      send({ type: "UPDATE_SETTINGS", settings });
    },
    [send]
  );

  const getMode = () => {
    if (state.matches("focus")) return "Focus";
    if (state.matches("shortBreak")) return "Short Break";
    if (state.matches("longBreak")) return "Long Break";
    return "Ready"; // for idle and paused states
  };

  return {
    timeLeft: state.context.timeLeft,
    startOrResumeTimer,
    pauseTimer,
    stopTimer,
    isPaused: state.matches("paused"),
    mode: getMode(),
    completedSessions: state.context.completedSessions,
    settings: state.context.settings,
    updateSettings,
  };
}
