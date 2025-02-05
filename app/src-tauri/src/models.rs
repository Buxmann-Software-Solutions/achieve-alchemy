use crate::schema::habit_completions;

use super::schema::habits;
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
