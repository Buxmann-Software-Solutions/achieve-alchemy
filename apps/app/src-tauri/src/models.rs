use std::clone;

use super::schema::pomodoro_cycles;
use super::schema::pomodoro_sessions;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable, Clone, specta::Type)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = pomodoro_cycles)]
pub struct PomodoroCycle {
    pub id: String,
    pub status: String,
    pub focus_duration: i32,
    pub short_break_duration: i32,
    pub long_break_duration: i32,
    pub sessions_until_long_break: i32,
    pub auto_start_breaks: bool,
    pub auto_start_pomodoros: bool,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = pomodoro_cycles)]
pub struct CreatePomodoroCycle {
    pub id: String,
    pub focus_duration: i32,
    pub short_break_duration: i32,
    pub long_break_duration: i32,
    pub sessions_until_long_break: i32,
    pub auto_start_breaks: bool,
    pub auto_start_pomodoros: bool,
    pub started_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, AsChangeset)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = pomodoro_cycles)]
pub struct UpdatePomodoroCycle {
    pub status: Option<String>,
    pub completed_at: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Queryable, Insertable, Clone, specta::Type)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = pomodoro_sessions)]
pub struct PomodoroSession {
    pub id: String,
    pub cycle_id: String,
    pub session_type: String,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub duration_minutes: i32,
    pub was_completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = pomodoro_sessions)]
pub struct CreatePomodoroSession {
    pub id: String,
    pub cycle_id: String,
    pub session_type: String,
    pub started_at: String,
    pub duration_minutes: i32,
}

#[derive(Debug, Serialize, Deserialize, AsChangeset, specta::Type, Clone)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = pomodoro_sessions)]
pub struct UpdatePomodoroSession {
    pub completed_at: Option<String>,
    pub was_completed: bool,
}
