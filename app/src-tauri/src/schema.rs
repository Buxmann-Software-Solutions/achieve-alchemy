// @generated automatically by Diesel CLI.

diesel::table! {
    habit_completions (id) {
        id -> Text,
        habit_id -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    habits (id) {
        id -> Text,
        title -> Text,
        description -> Text,
        icon -> Text,
        is_archived -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    pomodoro_cycles (id) {
        id -> Text,
        status -> Text,
        focus_duration -> Integer,
        short_break_duration -> Integer,
        long_break_duration -> Integer,
        sessions_until_long_break -> Integer,
        auto_start_breaks -> Bool,
        auto_start_pomodoros -> Bool,
        started_at -> Timestamp,
        completed_at -> Nullable<Timestamp>,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    pomodoro_sessions (id) {
        id -> Text,
        cycle_id -> Text,
        session_type -> Text,
        started_at -> Timestamp,
        completed_at -> Nullable<Timestamp>,
        duration_minutes -> Integer,
        was_completed -> Bool,
    }
}

diesel::joinable!(habit_completions -> habits (habit_id));
diesel::joinable!(pomodoro_sessions -> pomodoro_cycles (cycle_id));

diesel::allow_tables_to_appear_in_same_query!(
    habit_completions,
    habits,
    pomodoro_cycles,
    pomodoro_sessions,
);
