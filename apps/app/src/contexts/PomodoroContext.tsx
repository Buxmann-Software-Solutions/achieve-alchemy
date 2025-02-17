import { createContext, useContext, ReactNode } from "react";
import { useMachine } from "@xstate/react";
import {
  PomodoroEvent,
  PomodoroState,
  pomodoroMachine,
} from "../machines/PomodoroMachine";

interface PomodoroContextType {
  state: PomodoroState;
  send: (event: PomodoroEvent) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined
);

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

  const getMode = () => {
    if (state.matches("focus")) return "Focus";
    if (state.matches("shortBreak")) return "Short Break";
    if (state.matches("longBreak")) return "Long Break";
    return "Ready"; // for idle and paused states
  };

  return {
    state,
    send,
    mode: getMode(),
    completedSessions: state.context.completedSessions,
    settings: state.context.settings,
    timeLeft: formatTime(state.context.timeLeft),
  };
}

/**
 * Formats time in milliseconds to MM:SS format
 */
function formatTime(totalMilliseconds: number): string {
  if (isNaN(totalMilliseconds) || totalMilliseconds <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
