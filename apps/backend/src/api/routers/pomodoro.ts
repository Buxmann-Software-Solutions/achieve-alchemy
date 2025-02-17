import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { pomodoroCycles, pomodoroSessions } from '../../db/schema';
import { startOfDay, endOfDay } from 'date-fns';

const Status = z.enum(['COMPLETED', 'IN_PROGRESS', 'ABANDONED']);
const SessionType = z.enum(['LONG_BREAK', 'FOCUS', 'SHORT_BREAK']);

const startCycleSchema = z.object({
    focusDuration: z.number(),
    shortBreakDuration: z.number(),
    longBreakDuration: z.number(),
    sessionsUntilLongBreak: z.number(),
    autoStartBreaks: z.boolean(),
    autoStartPomodoros: z.boolean(),
});

const updateCycleStatusSchema = z.object({
    id: z.string(),
    status: Status,
});

const startSessionSchema = z.object({
    cycleId: z.string(),
    sessionType: SessionType,
    durationMinutes: z.number(),
});

const completeSessionSchema = z.object({
    sessionId: z.string(),
    wasCompleted: z.boolean(),
});

export const pomodoroRouter = createTRPCRouter({
    startCycle: protectedProcedure
        .input(startCycleSchema)
        .mutation(async ({ input, ctx }) => {
            const newCycle = {
                id: crypto.randomUUID(),
                userId: ctx.session.user.id,
                status: 'IN_PROGRESS',
                focusDuration: input.focusDuration,
                shortBreakDuration: input.shortBreakDuration,
                longBreakDuration: input.longBreakDuration,
                sessionsUntilLongBreak: input.sessionsUntilLongBreak,
                autoStartBreaks: input.autoStartBreaks,
                autoStartPomodoros: input.autoStartPomodoros,
                startedAt: new Date(),
                updatedAt: new Date(),
            };

            await ctx.db.insert(pomodoroCycles).values(newCycle);
            return ctx.db.query.pomodoroCycles.findFirst({
                where: eq(pomodoroCycles.id, newCycle.id),
            });
        }),

    getCurrentCycle: protectedProcedure.query(async ({ ctx }) => {
        const cycle = await ctx.db.query.pomodoroCycles.findFirst({
            where: and(
                eq(pomodoroCycles.userId, ctx.session.user.id),
                eq(pomodoroCycles.status, 'IN_PROGRESS')
            ),
            orderBy: desc(pomodoroCycles.startedAt),
            with: {
                pomodoroSessions: true,
            },
        });

        if (!cycle) return null;

        return cycle;
    }),

    updateCycleStatus: protectedProcedure
        .input(updateCycleStatusSchema)
        .mutation(async ({ input, ctx }) => {
            const now = new Date();
            await ctx.db
                .update(pomodoroCycles)
                .set({
                    status: input.status,
                    completedAt:
                        input.status === 'COMPLETED' || input.status === 'ABANDONED'
                            ? now
                            : null,
                    updatedAt: now,
                })
                .where(
                    and(
                        eq(pomodoroCycles.id, input.id),
                        eq(pomodoroCycles.userId, ctx.session.user.id)
                    )
                );

            return ctx.db.query.pomodoroCycles.findFirst({
                where: eq(pomodoroCycles.id, input.id),
            });
        }),

    startSession: protectedProcedure
        .input(startSessionSchema)
        .mutation(async ({ input, ctx }) => {
            const newSession = {
                id: crypto.randomUUID(),
                cycleId: input.cycleId,
                sessionType: input.sessionType,
                startedAt: new Date(),
                durationMinutes: input.durationMinutes,
                isCompleted: false,
            };

            await ctx.db.insert(pomodoroSessions).values(newSession);
            return ctx.db.query.pomodoroSessions.findFirst({
                where: eq(pomodoroSessions.id, newSession.id),
            });
        }),

    completeSession: protectedProcedure
        .input(completeSessionSchema)
        .mutation(async ({ input, ctx }) => {
            const now = new Date();
            await ctx.db
                .update(pomodoroSessions)
                .set({
                    completedAt: now,
                    isCompleted: input.wasCompleted,
                })
                .where(eq(pomodoroSessions.id, input.sessionId));

            return ctx.db.query.pomodoroSessions.findFirst({
                where: eq(pomodoroSessions.id, input.sessionId),
            });
        }),

    getDailyStats: protectedProcedure
        .input(z.object({ date: z.string() }))
        .query(async ({ input, ctx }) => {
            const date = new Date(input.date);
            const dayStart = startOfDay(date);
            const dayEnd = endOfDay(date);

            const sessions = await ctx.db.query.pomodoroSessions.findMany({
                where: and(
                    eq(pomodoroSessions.sessionType, 'FOCUS'),
                    eq(pomodoroSessions.isCompleted, true),
                    gte(pomodoroSessions.startedAt, dayStart),
                    lte(pomodoroSessions.startedAt, dayEnd)
                ),
            });

            return sessions.reduce((total, session) => total + session.durationMinutes, 0);
        }),
});
