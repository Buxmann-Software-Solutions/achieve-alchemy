import { toast } from "sonner";
import { assign, fromCallback, StateFrom } from "xstate";

import { createMachine } from "xstate";

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
type PomodoroContext = {
  settings: PomodoroSettings;
  completedSessions: number;
  currentCycleId?: string;
  currentSessionId?: string;
  timeLeft: number;
};

export type PomodoroEvent =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "TICK" }
  | { type: "SESSION_COMPLETE" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<PomodoroSettings> }
  | { type: "SET_CYCLE_ID"; cycleId: string }
  | { type: "SET_SESSION_ID"; sessionId: string };

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 20 * 1000, // 20 seconds in ms
  shortBreakDuration: 5 * 1000, // 5 seconds in ms
  longBreakDuration: 15 * 1000, // 15 seconds in ms
  sessionsUntilLongBreak: 1,
  autoStartBreaks: true,
  autoStartPomodoros: true,
};

export const pomodoroMachine = createMachine(
  {
    id: "pomodoro",
    types: {} as {
      context: PomodoroContext;
      events: PomodoroEvent;
    },
    initial: "idle",
    context: {
      settings: DEFAULT_SETTINGS,
      completedSessions: 0,
      timeLeft: DEFAULT_SETTINGS.focusDuration,
    },
    on: {
      UPDATE_SETTINGS: {
        actions: ["updateSettings", "adjustTimeLeft"],
      },
      STOP: {
        target: ".paused",
        actions: ["resetTimer"],
      },
    },
    states: {
      idle: {
        entry: ["resetEverything"],
        on: {
          START: {
            target: "focus",
            actions: ["resetTimer"],
          },
        },
      },
      focus: {
        entry: ["setFocusDuration"],
        invoke: {
          src: "timer",
        },
        on: {
          PAUSE: "paused",
          TICK: [
            {
              guard: "hasTimeLeft",
              actions: ["decrementTimer"],
            },
            {
              guard: "shouldTakeShortBreak",
              target: "shortBreak",
              actions: ["incrementCompletedSessions", "notifyTimeUp"],
            },
            {
              guard: "shouldTakeLongBreak",
              target: "longBreak",
              actions: ["incrementCompletedSessions", "notifyTimeUp"],
            },
          ],
        },
      },
      shortBreak: {
        entry: ["setShortBreakDuration"],
        invoke: {
          src: "timer",
        },
        on: {
          PAUSE: "paused",
          TICK: [
            {
              guard: "hasTimeLeft",
              actions: ["decrementTimer"],
            },
            {
              guard: "hasNoTimeLeft",
              target: "focus",
              actions: ["notifyTimeUp"],
            },
          ],
        },
      },
      longBreak: {
        entry: ["setLongBreakDuration"],
        invoke: {
          src: "timer",
        },
        on: {
          PAUSE: "paused",
          TICK: [
            {
              guard: "hasTimeLeft",
              actions: ["decrementTimer"],
            },
            {
              guard: "hasNoTimeLeft",
              target: "idle",
              actions: ["notifyTimeUp", "notifyCycleComplete"],
            },
          ],
        },
      },
      paused: {
        on: {
          RESUME: {
            target: "focus",
          },
          START: {
            target: "focus",
            actions: ["resetTimer"],
          },
        },
      },
    },
  },
  {
    guards: {
      hasTimeLeft: ({ context }) => context.timeLeft > 0,
      hasNoTimeLeft: ({ context }) => context.timeLeft <= 0,
      shouldTakeLongBreak: ({ context }) =>
        context.timeLeft <= 0 &&
        (context.completedSessions + 1) %
          context.settings.sessionsUntilLongBreak ===
          0,
      shouldTakeShortBreak: ({ context }) =>
        context.timeLeft <= 0 &&
        (context.completedSessions + 1) %
          context.settings.sessionsUntilLongBreak !==
          0,
    },
    actions: {
      resetEverything: assign({
        completedSessions: 0,
        timeLeft: ({ context }) => context.settings.focusDuration,
        currentCycleId: undefined,
        currentSessionId: undefined,
      }),
      notifyTimeUp: () => {
        toast.success("Time's up!");
      },
      notifyCycleComplete: () => {
        toast.success("Pomodoro cycle completed! Take a good rest. 🎉");
      },
      updateSettings: assign({
        settings: ({ context, event }) => {
          if (event.type !== "UPDATE_SETTINGS") return context.settings;
          return {
            ...context.settings,
            ...event.settings,
          };
        },
      }),
      adjustTimeLeft: assign({
        timeLeft: ({ context, event }) => {
          if (event.type !== "UPDATE_SETTINGS") return context.timeLeft;
          // If we're in focus mode, update to new focus duration
          if (context.timeLeft === context.settings.focusDuration) {
            return (
              event.settings.focusDuration ?? context.settings.focusDuration
            );
          }
          // If we're in short break, update to new short break duration
          if (context.timeLeft === context.settings.shortBreakDuration) {
            return (
              event.settings.shortBreakDuration ??
              context.settings.shortBreakDuration
            );
          }
          // If we're in long break, update to new long break duration
          if (context.timeLeft === context.settings.longBreakDuration) {
            return (
              event.settings.longBreakDuration ??
              context.settings.longBreakDuration
            );
          }
          // Otherwise keep current time
          return context.timeLeft;
        },
      }),
      resetTimer: assign({
        timeLeft: ({ context }) => context.settings.focusDuration,
      }),
      setFocusDuration: assign({
        timeLeft: ({ context }) => context.settings.focusDuration,
      }),
      setShortBreakDuration: assign({
        timeLeft: ({ context }) => context.settings.shortBreakDuration,
      }),
      setLongBreakDuration: assign({
        timeLeft: ({ context }) => context.settings.longBreakDuration,
      }),
      decrementTimer: assign({
        timeLeft: ({ context }) => Math.max(0, context.timeLeft - 1000),
      }),
      incrementCompletedSessions: assign({
        completedSessions: ({ context }) => context.completedSessions + 1,
      }),
    },
    actors: {
      timer: fromCallback(({ sendBack }) => {
        const interval = setInterval(() => {
          sendBack({ type: "TICK" });
        }, 1000);
        return () => clearInterval(interval);
      }),
    },
  }
);

export type PomodoroState = StateFrom<typeof pomodoroMachine>;
