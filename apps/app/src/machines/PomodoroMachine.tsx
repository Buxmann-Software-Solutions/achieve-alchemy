import { toast } from "sonner";
import { assign, fromCallback, StateFrom, createMachine } from "xstate";

// Pomodoro Settings
export interface PomodoroSettings {
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
  timeLeft: number;
};

export type PomodoroEvent =
  | { type: "START" }
  | { type: "RESTART" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "ABANDON" }
  | { type: "TICK" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<PomodoroSettings> };

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25 * 60 * 1000, // 25 minutes in ms
  shortBreakDuration: 5 * 60 * 1000, // 5 minutes in ms
  longBreakDuration: 15 * 60 * 1000, // 15 minutes in ms
  sessionsUntilLongBreak: 4,
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
      ABANDON: {
        target: ".idle",
        actions: ["resetEverything"],
      },
    },
    states: {
      idle: {
        entry: ["resetEverything"],
        on: {
          START: {
            target: "focus",
            actions: ["startCycle"],
          },
          UPDATE_SETTINGS: {
            actions: ["updateSettings", "adjustTimeLeft"],
          },
        },
      },
      focus: {
        invoke: {
          src: "timer",
        },
        on: {
          RESTART: {
            target: "focus",
            actions: ["resetTimer"],
          },
          PAUSE: "paused",
          TICK: [
            {
              guard: "hasTimeLeft",
              actions: ["decrementTimer"],
            },
            {
              guard: "shouldTakeShortBreak",
              target: "shortBreak",
              actions: [
                "incrementCompletedSessions",
                "notifyTimeUp",
                "setShortBreakDuration",
              ],
            },
            {
              guard: "shouldTakeLongBreak",
              target: "longBreak",
              actions: [
                "incrementCompletedSessions",
                "notifyTimeUp",
                "setLongBreakDuration",
              ],
            },
          ],
        },
      },
      paused: {
        on: {
          RESTART: {
            target: "focus",
            actions: ["resetTimer"],
          },
          RESUME: {
            target: "focus",
          },
          START: {
            target: "focus",
          },
        },
      },
      shortBreak: {
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
              actions: ["notifyTimeUp", "setFocusDuration"],
            },
          ],
        },
      },
      longBreak: {
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
      }),
      startCycle: assign({
        timeLeft: ({ context }) => context.settings.focusDuration,
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

          const newSettings = {
            ...context.settings,
            ...event.settings,
          };

          // If we're in focus mode or about to start, update to new focus duration
          if (context.timeLeft === context.settings.focusDuration) {
            return newSettings.focusDuration;
          }
          // If we're in short break, update to new short break duration
          if (context.timeLeft === context.settings.shortBreakDuration) {
            return newSettings.shortBreakDuration;
          }
          // If we're in long break, update to new long break duration
          if (context.timeLeft === context.settings.longBreakDuration) {
            return newSettings.longBreakDuration;
          }
          // Otherwise keep current time
          return context.timeLeft;
        },
      }),
      startTimer: assign({
        timeLeft: ({ context }) => context.settings.focusDuration,
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
