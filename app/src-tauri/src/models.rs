use std::clone;

use super::schema::habit_completions;
use super::schema::habits;
use super::schema::pomodoro_cycles;
use super::schema::pomodoro_sessions;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Queryable, specta::Type, Selectable, Insertable, Debug)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = habits)]
#[serde(rename_all = "camelCase")]
pub struct Habit {
    pub id: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub is_archived: bool,
    pub updated_at: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone, AsChangeset, Debug, Insertable)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = habits)]
#[serde(rename_all = "camelCase")]

pub struct UpdateHabit {
    pub title: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub is_archived: Option<bool>,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone, Queryable, Selectable, specta::Type, Debug)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = habit_completions)]
#[serde(rename_all = "camelCase")]
pub struct HabitCompletion {
    pub id: String,
    pub habit_id: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone, Queryable, Insertable, Selectable, specta::Type, Debug)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(table_name = habit_completions)]
#[serde(rename_all = "camelCase")]
pub struct CreateHabitCompletion {
    pub id: String,
    pub habit_id: String,
    pub created_at: String,
}

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
