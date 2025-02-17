import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    habits: many(habits),
    pomodoroCycles: many(pomodoroCycles),
}));

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at')
});

export const habits = pgTable("habits", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),
    isArchived: boolean("isArchived").notNull(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const habitsRelations = relations(habits, ({ one, many }) => ({
    user: one(user, {
        fields: [habits.userId],
        references: [user.id],
    }),
    habitCompletions: many(habitCompletions),
}));

export const habitCompletions = pgTable("habit_completions", {
    id: text("id").notNull(),
    habitId: text("habitId").notNull().references(() => habits.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull(),
});

export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
    habit: one(habits, {
        fields: [habitCompletions.habitId],
        references: [habits.id],
    }),
}));

export const pomodoroCycles = pgTable("pomodoro_cycles", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    status: text("status").notNull(),
    focusDuration: integer("focusDuration").notNull(),
    shortBreakDuration: integer("shortBreakDuration").notNull(),
    longBreakDuration: integer("longBreakDuration").notNull(),
    sessionsUntilLongBreak: integer("sessionsUntilLongBreak").notNull(),
    autoStartBreaks: boolean("autoStartBreaks").notNull(),
    autoStartPomodoros: boolean("autoStartPomodoros").notNull(),
    startedAt: timestamp("startedAt").notNull(),
    completedAt: timestamp("completedAt"),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const pomodoroCyclesRelations = relations(pomodoroCycles, ({ one, many }) => ({
    user: one(user, {
        fields: [pomodoroCycles.userId],
        references: [user.id],
    }),
    pomodoroSessions: many(pomodoroSessions),
}));

export const pomodoroSessions = pgTable("pomodoro_sessions", {
    id: text("id").primaryKey().notNull(),
    cycleId: text("cycleId").notNull().references(() => pomodoroCycles.id, { onDelete: "cascade" }),
    sessionType: text("sessionType").notNull(),
    startedAt: timestamp("startedAt").notNull(),
    completedAt: timestamp("completedAt"),
    durationMinutes: integer("durationMinutes").notNull(),
    isCompleted: boolean("isCompleted").notNull(),
});

export const pomodoroSessionsRelations = relations(pomodoroSessions, ({ one }) => ({
    cycle: one(pomodoroCycles, {
        fields: [pomodoroSessions.cycleId],
        references: [pomodoroCycles.id],
    }),
}));
