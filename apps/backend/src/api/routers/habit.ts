import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import { habits, habitCompletions } from '../../db/schema';
import { format, startOfDay, subDays } from 'date-fns';

const createHabitSchema = z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
});

const updateHabitSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    isArchived: z.boolean().optional(),
});

const toggleCompletionSchema = z.object({
    id: z.string().optional(),
    habitId: z.string(),
    createdAt: z.string().optional(),
});

export const habitRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createHabitSchema)
        .mutation(async ({ input, ctx }) => {
            return ctx.db.insert(habits).values({
                id: crypto.randomUUID(),
                title: input.title,
                description: input.description,
                icon: input.icon,
                userId: ctx.session.user.id,
                isArchived: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }),

    getActive: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.query.habits.findMany({
            where: (habits, { eq, and }) =>
                and(
                    eq(habits.userId, ctx.session.user.id),
                    eq(habits.isArchived, false)
                ),
            orderBy: desc(habits.createdAt),
        });
    }),

    getArchived: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.query.habits.findMany({
            where: (habits, { eq, and }) =>
                and(
                    eq(habits.userId, ctx.session.user.id),
                    eq(habits.isArchived, true)
                ),
            orderBy: desc(habits.createdAt),
        });
    }),

    update: protectedProcedure
        .input(updateHabitSchema)
        .mutation(async ({ input, ctx }) => {
            return ctx.db
                .update(habits)
                .set({
                    ...(input.title && { title: input.title }),
                    ...(input.description && { description: input.description }),
                    ...(input.icon && { icon: input.icon }),
                    ...(typeof input.isArchived !== 'undefined' && {
                        isArchived: input.isArchived ? true : false
                    }),
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(habits.id, input.id),
                        eq(habits.userId, ctx.session.user.id)
                    )
                );
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            return ctx.db
                .delete(habits)
                .where(
                    and(
                        eq(habits.id, input.id),
                        eq(habits.userId, ctx.session.user.id)
                    )
                );
        }),

    toggleCompletion: protectedProcedure
        .input(toggleCompletionSchema)
        .mutation(async ({ input, ctx }) => {
            if (input.id) {
                // If ID provided, delete the completion
                return ctx.db
                    .delete(habitCompletions)
                    .where(
                        and(
                            eq(habitCompletions.id, input.id),
                            eq(habitCompletions.habitId, input.habitId)
                        )
                    );
            } else {
                // Otherwise create a new completion
                return ctx.db.insert(habitCompletions).values({
                    id: crypto.randomUUID(),
                    habitId: input.habitId,
                    createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
                });
            }
        }),

    getCompletions: protectedProcedure
        .input(z.object({
            habitId: z.string(),
            limit: z.number().optional(),
        }))
        .query(async ({ input, ctx }) => {
            return ctx.db.query.habitCompletions.findMany({
                where: eq(habitCompletions.habitId, input.habitId),
                orderBy: desc(habitCompletions.createdAt),
                limit: input.limit,
            });
        }),

    getStreak: protectedProcedure
        .input(z.object({ habitId: z.string() }))
        .query(async ({ input, ctx }) => {
            const completions = await ctx.db.query.habitCompletions.findMany({
                where: eq(habitCompletions.habitId, input.habitId),
                orderBy: desc(habitCompletions.createdAt),
            });

            // Convert completions to dates and sort
            const dates = completions
                .map((completion) => format(completion.createdAt, 'yyyy-MM-dd'))
                .sort();

            let streak = 0;
            const currentDate = startOfDay(new Date());
            let previousDate = subDays(currentDate, 1);

            if (dates.includes(format(currentDate, 'yyyy-MM-dd'))) {
                streak++;
            }

            // Count streak by checking consecutive days
            while (dates.includes(format(previousDate, 'yyyy-MM-dd'))) {
                streak++;
                previousDate = subDays(previousDate, 1);
            }

            return streak;
        }),
});
