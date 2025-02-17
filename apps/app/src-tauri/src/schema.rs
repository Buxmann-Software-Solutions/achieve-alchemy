// @generated automatically by Diesel CLI.

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

diesel::joinable!(pomodoro_sessions -> pomodoro_cycles (cycle_id));

diesel::allow_tables_to_appear_in_same_query!(pomodoro_cycles, pomodoro_sessions,);
