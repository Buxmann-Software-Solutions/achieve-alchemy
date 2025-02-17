import { createTRPCRouter } from './trpc';
import { habitRouter } from './routers/habit';
import { pomodoroRouter } from './routers/pomodoro';

export const appRouter = createTRPCRouter({
    habit: habitRouter,
    pomodoro: pomodoroRouter,
})

export type AppRouter = typeof appRouter