// This file has been generated by Specta. DO NOT EDIT.

import { createTauRPCProxy as createProxy, type InferCommandOutput } from 'taurpc'


export type ActivateLicenseKeyArgs = { licenseKey: string; instanceName: string }

export type ActivateLicenseKeyResponse = { isActivated: boolean; instanceId: string }

export type CompleteSessionArgs = { sessionId: string; wasCompleted: boolean }

export type CreateHabitArgs = { title: string; description: string; icon: string }

export type CreateHabitCompletionArgs = { id: string | null; habitId: string; createdAt: string | null }

export type CreateSessionArgs = { cycleId: string; sessionType: SessionType; durationMinutes: number }

export type DeactivateLicenseKeyArgs = { licenseKey: string; instanceId: string }

export type DeactivateLicenseKeyResponse = { isDeactivated: boolean }

export type GetHabitCompletionsArgs = { habitId: string; limit: number | null }

export type GetPomodoroCycleWithRelationships = { id: string; status: Status; focusDuration: number; shortBreakDuration: number; longBreakDuration: number; sessionsUntilLongBreak: number; autoStartBreaks: boolean; autoStartPomodoros: boolean; startedAt: string; completedAt: string | null; updatedAt: string; sessions: PomodoroSession[] }

export type Habit = { id: string; title: string; description: string; icon: string; isArchived: boolean; updatedAt: string; createdAt: string }

export type HabitCompletion = { id: string; habitId: string; createdAt: string }

export type PomodoroCycle = { id: string; status: string; focus_duration: number; short_break_duration: number; long_break_duration: number; sessions_until_long_break: number; auto_start_breaks: boolean; auto_start_pomodoros: boolean; started_at: string; completed_at: string | null; updated_at: string }

export type PomodoroSession = { id: string; cycle_id: string; session_type: string; started_at: string; completed_at: string | null; duration_minutes: number; was_completed: boolean }

export type SessionType = "LONG_BREAK" | "FOCUS" | "SHORT_BREAK"

export type StartCycleArgs = { focusDuration: number; shortBreakDuration: number; longBreakDuration: number; sessionsUntilLongBreak: number; autoStartBreaks: boolean; autoStartPomodoros: boolean }

export type Status = "COMPLETED" | "IN_PROGRESS" | "ABANDONED"

export type UpdateCycleArgs = { id: string; status: Status }

export type UpdateHabitArgs = { id: string; title: string | null; description: string | null; icon: string | null; isArchived: boolean | null }

export type ValidateLicenseKeyArgs = { licenseKey: string; instanceId: string }

export type ValidateLicenseKeyResponse = { isValid: boolean }

const ARGS_MAP = { '': '{"get_active_habits":[],"start_session":["args"],"get_daily_stats":["date"],"get_current_cycle":[],"activate_license_key":["args"],"complete_session":["args"],"update_habit":["args"],"get_habit_completion_streak":["habit_id"],"update_cycle_status":["args"],"create_habit":["args"],"validate_license_key":["args"],"deactivate_license_key":["args"],"get_archived_habits":[],"start_pomodoro_cycle":["args"],"get_habit_completions":["args"],"delete_habit":["habit_id"],"toggle_habit_completion":["args"]}' }
export type Router = {
    '': {
        activate_license_key: (args: ActivateLicenseKeyArgs) => Promise<ActivateLicenseKeyResponse>,
        validate_license_key: (args: ValidateLicenseKeyArgs) => Promise<ValidateLicenseKeyResponse>,
        deactivate_license_key: (args: DeactivateLicenseKeyArgs) => Promise<DeactivateLicenseKeyResponse>,
        create_habit: (args: CreateHabitArgs) => Promise<void>,
        get_active_habits: () => Promise<Habit[]>,
        get_archived_habits: () => Promise<Habit[]>,
        update_habit: (args: UpdateHabitArgs) => Promise<void>,
        delete_habit: (habitId: string) => Promise<void>,
        toggle_habit_completion: (args: CreateHabitCompletionArgs) => Promise<void>,
        get_habit_completions: (args: GetHabitCompletionsArgs) => Promise<HabitCompletion[]>,
        get_habit_completion_streak: (habitId: string) => Promise<number>,
        start_pomodoro_cycle: (args: StartCycleArgs) => Promise<PomodoroCycle>,
        get_current_cycle: () => Promise<GetPomodoroCycleWithRelationships | null>,
        update_cycle_status: (args: UpdateCycleArgs) => Promise<PomodoroCycle>,
        start_session: (args: CreateSessionArgs) => Promise<PomodoroSession>,
        complete_session: (args: CompleteSessionArgs) => Promise<PomodoroSession>,
        get_daily_stats: (date: string) => Promise<number>
    }
};


export type { InferCommandOutput }
export const createTauRPCProxy = () => createProxy<Router>(ARGS_MAP)
