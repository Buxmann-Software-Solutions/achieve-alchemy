use std::sync::{Arc, Mutex};

use chrono::{Duration, NaiveDate, Utc};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel::sqlite::SqliteConnection;
use models::{CreateHabitCompletion, Habit, UpdateHabit};
use reqwest;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

mod db;
mod models;
mod schema;

// --------------------------------------------------------------------------
// License key
// --------------------------------------------------------------------------
#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct ActivateLicenseKeyArgs {
    license_key: String,
    instance_name: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct ActivateLicenseKeyResponse {
    is_activated: bool,
    instance_id: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct ValidateLicenseKeyArgs {
    license_key: String,
    instance_id: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct ValidateLicenseKeyResponse {
    is_valid: bool,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct DeactivateLicenseKeyArgs {
    license_key: String,
    instance_id: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct DeactivateLicenseKeyResponse {
    is_deactivated: bool,
}

// --------------------------------------------------------------------------
// Habits
// --------------------------------------------------------------------------

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct CreateHabitArgs {
    title: String,
    description: String,
    icon: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct UpdateHabitArgs {
    id: String,
    title: Option<String>,
    description: Option<String>,
    icon: Option<String>,
    is_archived: Option<bool>,
}

// --------------------------------------------------------------------------
// Habit completions
// --------------------------------------------------------------------------

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct CreateHabitCompletionArgs {
    id: Option<String>,
    habit_id: String,
    created_at: Option<String>,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct GetHabitCompletionsArgs {
    habit_id: String,
    limit: Option<i32>,
}

// --------------------------------------------------------------------------
// Pomodoro
// --------------------------------------------------------------------------

#[derive(Serialize, Deserialize, specta::Type, Debug, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
enum Status {
    Completed,
    InProgress,
    Abandoned,
}

impl Status {
    fn from_str(s: &str) -> Self {
        match s {
            "COMPLETED" => Status::Completed,
            "IN_PROGRESS" => Status::InProgress,
            "ABANDONED" => Status::Abandoned,
            _ => Status::InProgress, // Default to in progress instead of unrecognized
        }
    }
    fn to_str(&self) -> &str {
        match self {
            Status::Completed => "COMPLETED",
            Status::InProgress => "IN_PROGRESS",
            Status::Abandoned => "ABANDONED",
        }
    }
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct GetPomodoroCycleWithRelationships {
    id: String,
    status: Status,
    focus_duration: i32,
    short_break_duration: i32,
    long_break_duration: i32,
    sessions_until_long_break: i32,
    auto_start_breaks: bool,
    auto_start_pomodoros: bool,
    started_at: String,
    completed_at: Option<String>,
    updated_at: String,
    sessions: Vec<models::PomodoroSession>,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct GetPomodoroCyclesArgs {
    status: Status,
    limit: Option<i32>,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct StartCycleArgs {
    focus_duration: i32,
    short_break_duration: i32,
    long_break_duration: i32,
    sessions_until_long_break: i32,
    auto_start_breaks: bool,
    auto_start_pomodoros: bool,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct UpdateCycleArgs {
    id: String,
    status: Status,
}

#[derive(Serialize, Deserialize, specta::Type, Debug, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
enum SessionType {
    LongBreak,
    Focus,
    ShortBreak,
}

impl SessionType {
    fn from_str(s: &str) -> Self {
        match s {
            "LONG_BREAK" => SessionType::LongBreak,
            "FOCUS" => SessionType::Focus,
            "SHORT_BREAK" => SessionType::ShortBreak,
            _ => SessionType::Focus, // Default to focus instead of unrecognized
        }
    }
    fn to_str(&self) -> &str {
        match self {
            SessionType::LongBreak => "LONG_BREAK",
            SessionType::Focus => "FOCUS",
            SessionType::ShortBreak => "SHORT_BREAK",
        }
    }
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct CreateSessionArgs {
    cycle_id: String,
    session_type: SessionType,
    duration_minutes: i32,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct GetTotalFocusTimeArgs {
    start_date: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct CompleteSessionArgs {
    session_id: String,
    was_completed: bool,
}

#[taurpc::procedures(export_to = "../src/bindings.ts")]
trait Api {
    // License key
    async fn activate_license_key(args: ActivateLicenseKeyArgs) -> ActivateLicenseKeyResponse;
    async fn validate_license_key(args: ValidateLicenseKeyArgs) -> ValidateLicenseKeyResponse;
    async fn deactivate_license_key(args: DeactivateLicenseKeyArgs)
        -> DeactivateLicenseKeyResponse;

    // Habits
    async fn create_habit(args: CreateHabitArgs);
    async fn get_active_habits() -> Vec<Habit>;
    async fn get_archived_habits() -> Vec<Habit>;
    async fn update_habit(args: UpdateHabitArgs);
    async fn delete_habit(habit_id: String);

    // Habit completions
    async fn toggle_habit_completion(args: CreateHabitCompletionArgs);
    async fn get_habit_completions(args: GetHabitCompletionsArgs) -> Vec<models::HabitCompletion>;
    async fn get_habit_completion_streak(habit_id: String) -> i32;

    // Pomodoro
    async fn start_pomodoro_cycle(args: StartCycleArgs) -> Result<models::PomodoroCycle, String>;
    async fn get_current_cycle() -> Result<Option<GetPomodoroCycleWithRelationships>, String>;
    async fn update_cycle_status(args: UpdateCycleArgs) -> Result<models::PomodoroCycle, String>;
    async fn start_session(args: CreateSessionArgs) -> Result<models::PomodoroSession, String>;
    async fn complete_session(args: CompleteSessionArgs)
        -> Result<models::PomodoroSession, String>;
    async fn get_daily_stats(date: String) -> Result<i32, String>;
}

#[derive(Clone)]
struct ApiImpl {
    pool: Arc<Mutex<Option<Pool<ConnectionManager<SqliteConnection>>>>>,
}

impl ApiImpl {
    fn get_connection(&self) -> PooledConnection<ConnectionManager<SqliteConnection>> {
        self.pool
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .get()
            .expect("Failed to get a connection from the pool")
    }
}

const API_URL: &str = "https://test-api.creem.io/v1";
const API_KEY: &str = "test-api-key";

#[taurpc::resolvers]
impl Api for ApiImpl {
    // --------------------------------------------------------------------------
    // License key
    // --------------------------------------------------------------------------
    async fn activate_license_key(
        self,
        args: ActivateLicenseKeyArgs,
    ) -> ActivateLicenseKeyResponse {
        let client = reqwest::Client::new();
        let response = client
            .post("https://test-api.creem.io/v1/licenses/activate")
            .header("accept", "application/json")
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "key": args.license_key,
                "instance_name": args.instance_name
            }))
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send activate request");

        println!("Activate license key response: {:?}", response);

        if response.status().is_success() {
            ActivateLicenseKeyResponse {
                is_activated: true,
                instance_id: "1".to_string(),
            }
        } else {
            ActivateLicenseKeyResponse {
                is_activated: false,
                instance_id: "1".to_string(),
            }
        }
    }

    async fn validate_license_key(
        self,
        args: ValidateLicenseKeyArgs,
    ) -> ValidateLicenseKeyResponse {
        let client = reqwest::Client::new();
        let response = client
            .post(format!("{}/licenses/validate", API_URL))
            .header("accept", "application/json")
            .header("x-api-key", API_KEY)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "key": args.license_key,
                "instance_id": args.instance_id
            }))
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send validate request");

        if response.status().is_success() {
            ValidateLicenseKeyResponse { is_valid: true }
        } else {
            ValidateLicenseKeyResponse { is_valid: false }
        }
    }

    async fn deactivate_license_key(
        self,
        args: DeactivateLicenseKeyArgs,
    ) -> DeactivateLicenseKeyResponse {
        let client = reqwest::Client::new();
        let response = client
            .post(format!("{}/licenses/deactivate", API_URL))
            .header("accept", "application/json")
            .header("x-api-key", API_KEY)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "key": args.license_key,
                "instance_id": args.instance_id
            }))
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send deactivate request");

        if response.status().is_success() {
            DeactivateLicenseKeyResponse {
                is_deactivated: true,
            }
        } else {
            DeactivateLicenseKeyResponse {
                is_deactivated: false,
            }
        }
    }

    // --------------------------------------------------------------------------
    // Habits
    // --------------------------------------------------------------------------
    async fn create_habit(self, args: CreateHabitArgs) {
        let connection = &mut self.get_connection();

        let new_habit = models::Habit {
            id: Uuid::new_v4().to_string(),
            title: args.title,
            description: args.description,
            icon: args.icon,
            is_archived: false,
            updated_at: chrono::Utc::now().to_rfc3339(),
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        println!("Creating habit: {:?}", new_habit);

        diesel::insert_into(schema::habits::table)
            .values(&new_habit)
            .execute(connection)
            .expect("Error saving new habit");
    }

    async fn get_active_habits(self) -> Vec<models::Habit> {
        use crate::schema::habits::dsl::*;

        let connection = &mut self.get_connection();

        habits
            .filter(is_archived.eq(false))
            .order(created_at.desc())
            .load::<models::Habit>(connection)
            .expect("Error loading habits")
    }

    async fn get_archived_habits(self) -> Vec<models::Habit> {
        use crate::schema::habits::dsl::*;

        let connection = &mut self.get_connection();

        let results = habits
            .filter(is_archived.eq(true))
            .order(created_at.desc())
            .load::<models::Habit>(connection)
            .expect("Error loading habits");

        return results;
    }

    async fn update_habit(self, args: UpdateHabitArgs) {
        use crate::schema::habits::dsl::*;

        let connection = &mut self.get_connection();

        let updated_habit = UpdateHabit {
            title: args.title,
            description: args.description,
            icon: args.icon,
            is_archived: args.is_archived,
            updated_at: chrono::Utc::now().to_rfc3339(),
        };

        diesel::update(habits)
            .filter(id.eq(args.id))
            .set(&updated_habit)
            .execute(connection)
            .expect("Error updating habit");
    }

    async fn delete_habit(self, habit_id: String) {
        use crate::schema::habits::dsl::*;
        use diesel::prelude::*;

        let connection = &mut self.get_connection();

        diesel::delete(habits)
            .filter(id.eq(habit_id))
            .execute(connection)
            .expect("Error deleting habit");
    }

    // --------------------------------------------------------------------------
    // Habit completions
    // --------------------------------------------------------------------------
    async fn toggle_habit_completion(self, args: CreateHabitCompletionArgs) {
        use crate::schema::habit_completions::dsl::habit_completions;

        let connection = &mut self.get_connection();

        let new_habit_completion = CreateHabitCompletion {
            id: args
                .id
                .clone()
                .unwrap_or_else(|| Uuid::new_v4().to_string()),
            habit_id: args.habit_id,
            created_at: match args.created_at {
                Some(date_str) => NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
                    .map(|date| date.and_hms(0, 0, 0))
                    .map(|dt| dt.format("%Y-%m-%d").to_string())
                    .unwrap_or_else(|_| Utc::now().naive_utc().format("%Y-%m-%d").to_string()),
                None => Utc::now().naive_utc().format("%Y-%m-%d").to_string(),
            },
        };

        match args.id {
            Some(id) => {
                diesel::delete(habit_completions.find(id))
                    .execute(connection)
                    .expect("Error deleting habit completion");
            }
            None => {
                diesel::insert_into(habit_completions)
                    .values(&new_habit_completion)
                    .execute(connection)
                    .expect("Error saving new habit completion");
            }
        }
    }

    async fn get_habit_completions(
        self,
        args: GetHabitCompletionsArgs,
    ) -> Vec<models::HabitCompletion> {
        use crate::schema::habit_completions::dsl::{created_at, habit_completions, habit_id};

        let connection = &mut self.get_connection();

        match args.limit {
            Some(limit) => {
                let limit = limit as i64;

                return habit_completions
                    .filter(habit_id.eq(args.habit_id))
                    .order(created_at.desc())
                    .limit(limit)
                    .load::<models::HabitCompletion>(connection)
                    .expect("Error loading habit completions");
            }
            None => {
                return habit_completions
                    .filter(habit_id.eq(args.habit_id))
                    .order(created_at.desc())
                    .load::<models::HabitCompletion>(connection)
                    .expect("Error loading habit completions");
            }
        };
    }

    async fn get_habit_completion_streak(self, id: String) -> i32 {
        use crate::schema::habit_completions::dsl::{created_at, habit_completions, habit_id};

        let connection = &mut self.get_connection();

        let results = habit_completions
            .filter(habit_id.eq(id))
            .order(created_at.desc())
            .load::<models::HabitCompletion>(connection)
            .expect("Error loading habit completions");

        // Create a HashSet of dates from the results
        let mut dates_set: Vec<NaiveDate> = results
            .iter()
            .filter_map(|result| NaiveDate::parse_from_str(&result.created_at, "%Y-%m-%d").ok())
            .collect();

        // sort the date_set
        dates_set.sort();

        let mut streak = 0;
        let current_date = Utc::now().naive_utc().date();
        let mut previous_date = current_date - Duration::days(1);

        // Iterate backwards from today and check if each date exists in the HashSet
        while dates_set.contains(&previous_date) {
            streak += 1;
            previous_date = previous_date - Duration::days(1);
        }

        if dates_set.contains(&current_date) {
            streak += 1;
        }

        streak
    }

    // --------------------------------------------------------------------------
    // Pomodoro
    // --------------------------------------------------------------------------
    async fn start_pomodoro_cycle(
        self,
        args: StartCycleArgs,
    ) -> Result<models::PomodoroCycle, String> {
        use crate::schema::pomodoro_cycles::dsl::*;

        let connection = &mut self.get_connection();

        let new_cycle = models::CreatePomodoroCycle {
            id: Uuid::new_v4().to_string(),
            focus_duration: args.focus_duration,
            short_break_duration: args.short_break_duration,
            long_break_duration: args.long_break_duration,
            sessions_until_long_break: args.sessions_until_long_break,
            auto_start_breaks: args.auto_start_breaks,
            auto_start_pomodoros: args.auto_start_pomodoros,
            started_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
        };

        diesel::insert_into(pomodoro_cycles)
            .values(&new_cycle)
            .execute(connection)
            .map_err(|e| e.to_string())?;

        pomodoro_cycles
            .find(new_cycle.id)
            .first(connection)
            .map_err(|e| e.to_string())
    }

    async fn get_current_cycle(self) -> Result<Option<GetPomodoroCycleWithRelationships>, String> {
        use crate::schema::pomodoro_cycles::dsl::*;
        use crate::schema::pomodoro_sessions::dsl as sessions_dsl;

        let connection = &mut self.get_connection();

        // Get the most recent in-progress cycle
        let cycle = pomodoro_cycles
            .filter(status.eq("IN_PROGRESS"))
            .order(started_at.desc())
            .first::<models::PomodoroCycle>(connection)
            .optional()
            .map_err(|e| e.to_string())?;

        match cycle {
            Some(cycle) => {
                // Get all sessions for this cycle
                let sessions = sessions_dsl::pomodoro_sessions
                    .filter(sessions_dsl::cycle_id.eq(&cycle.id))
                    .load::<models::PomodoroSession>(connection)
                    .map_err(|e| e.to_string())?;

                Ok(Some(GetPomodoroCycleWithRelationships {
                    id: cycle.id,
                    status: Status::from_str(&cycle.status),
                    focus_duration: cycle.focus_duration,
                    short_break_duration: cycle.short_break_duration,
                    long_break_duration: cycle.long_break_duration,
                    sessions_until_long_break: cycle.sessions_until_long_break,
                    auto_start_breaks: cycle.auto_start_breaks,
                    auto_start_pomodoros: cycle.auto_start_pomodoros,
                    started_at: cycle.started_at,
                    completed_at: cycle.completed_at,
                    updated_at: cycle.updated_at,
                    sessions,
                }))
            }
            None => Ok(None),
        }
    }

    async fn update_cycle_status(
        self,
        args: UpdateCycleArgs,
    ) -> Result<models::PomodoroCycle, String> {
        use crate::schema::pomodoro_cycles::dsl::*;

        let connection = &mut self.get_connection();

        let update = models::UpdatePomodoroCycle {
            status: Some(args.status.to_str().to_string()),
            completed_at: if matches!(args.status, Status::Completed | Status::Abandoned) {
                Some(Utc::now().to_rfc3339())
            } else {
                None
            },
            updated_at: Utc::now().to_rfc3339(),
        };

        diesel::update(pomodoro_cycles.find(args.id.clone()))
            .set(&update)
            .execute(connection)
            .map_err(|e| e.to_string())?;

        pomodoro_cycles
            .find(args.id)
            .first(connection)
            .map_err(|e| e.to_string())
    }

    async fn start_session(
        self,
        args: CreateSessionArgs,
    ) -> Result<models::PomodoroSession, String> {
        use crate::schema::pomodoro_sessions::dsl::*;

        let connection = &mut self.get_connection();

        let new_session = models::CreatePomodoroSession {
            id: Uuid::new_v4().to_string(),
            cycle_id: args.cycle_id,
            session_type: args.session_type.to_str().to_string(),
            started_at: Utc::now().to_rfc3339(),
            duration_minutes: args.duration_minutes,
        };

        diesel::insert_into(pomodoro_sessions)
            .values(&new_session)
            .execute(connection)
            .map_err(|e| e.to_string())?;

        pomodoro_sessions
            .find(new_session.id)
            .first(connection)
            .map_err(|e| e.to_string())
    }

    async fn complete_session(
        self,
        args: CompleteSessionArgs,
    ) -> Result<models::PomodoroSession, String> {
        use crate::schema::pomodoro_sessions::dsl::*;

        let connection = &mut self.get_connection();

        let update = models::UpdatePomodoroSession {
            completed_at: Some(Utc::now().to_rfc3339()),
            was_completed: args.was_completed,
        };

        diesel::update(pomodoro_sessions.find(args.session_id.clone()))
            .set(&update)
            .execute(connection)
            .map_err(|e| e.to_string())?;

        pomodoro_sessions
            .find(args.session_id)
            .first(connection)
            .map_err(|e| e.to_string())
    }

    async fn get_daily_stats(self, date: String) -> Result<i32, String> {
        use crate::schema::pomodoro_sessions::dsl::*;

        let connection = &mut self.get_connection();

        // Parse the date string to get start and end of day
        let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d").map_err(|e| e.to_string())?;
        let start_of_day = format!("{}T00:00:00Z", date.format("%Y-%m-%d"));
        let end_of_day = format!("{}T23:59:59Z", date.format("%Y-%m-%d"));

        // Get all completed focus sessions for the day
        let total_minutes: i32 = pomodoro_sessions
            .filter(session_type.eq("FOCUS"))
            .filter(was_completed.eq(true))
            .filter(started_at.ge(start_of_day))
            .filter(started_at.le(end_of_day))
            .select(duration_minutes)
            .get_results::<i32>(connection)
            .map_err(|e| e.to_string())?
            .into_iter()
            .sum();

        Ok(total_minutes)
    }
}

#[tokio::main]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let pool = Arc::new(Mutex::new(None));
    let pool_clone = pool.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let db_pool = db::setup_db(&app);
            *pool_clone.lock().unwrap() = Some(db_pool);
            Ok(())
        })
        .invoke_handler(taurpc::create_ipc_handler(ApiImpl { pool }.into_handler()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
