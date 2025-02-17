use chrono::{Duration, NaiveDate, Utc};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel::sqlite::SqliteConnection;
use reqwest;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Runtime};
use tauri_plugin_opener::OpenerExt;
use uuid::Uuid;

mod db;
mod models;
mod schema;

// --------------------------------------------------------------------------
// Creem
// --------------------------------------------------------------------------
#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct GenerateCheckoutSessionResponse {
    id: String,
    object: String,
    product: String,
    units: Option<String>,
    status: String,
    checkout_url: String,
    mode: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct ActivateLicenseKeyArgs {
    key: String,
    instance_name: String,
}

#[taurpc::ipc_type]
#[derive(Debug)]
#[serde(rename_all = "camelCase")]
struct ActivateLicenseKeyResponse {
    is_activated: bool,
    instance_id: Option<String>,
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
    // Creem
    async fn generate_checkout_session<R: Runtime>(app_handle: AppHandle<R>);
    async fn activate_license_key(args: ActivateLicenseKeyArgs) -> ActivateLicenseKeyResponse;
    async fn validate_license_key(args: ValidateLicenseKeyArgs) -> ValidateLicenseKeyResponse;
    async fn deactivate_license_key(args: DeactivateLicenseKeyArgs)
        -> DeactivateLicenseKeyResponse;

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

const BACKEND_URL: &str = "http://localhost:8787";

#[taurpc::resolvers]
impl Api for ApiImpl {
    // --------------------------------------------------------------------------
    // Creem
    // --------------------------------------------------------------------------
    async fn generate_checkout_session<R: Runtime>(self, app_handle: AppHandle<R>) {
        let checkout_session_response = reqwest::Client::new()
            .post(format!("{}/checkout", BACKEND_URL))
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send generate checkout session request");

        let response = checkout_session_response
            .json::<GenerateCheckoutSessionResponse>()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to parse generate checkout session response");

        let _ = app_handle
            .opener()
            .open_path(response.checkout_url.clone(), None::<&str>)
            .expect("Failed to open checkout URL");
    }

    async fn activate_license_key(
        self,
        args: ActivateLicenseKeyArgs,
    ) -> ActivateLicenseKeyResponse {
        let activate_license_key_response = reqwest::Client::new()
            .post(format!("{}/licenses/activate", BACKEND_URL))
            .header("Content-Type", "application/json")
            .json(&args)
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send activate request");

        let response = &activate_license_key_response
            .json::<ActivateLicenseKeyResponse>()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to parse activate response");

        ActivateLicenseKeyResponse {
            is_activated: response.is_activated,
            instance_id: response.instance_id.clone(),
        }
    }

    async fn validate_license_key(
        self,
        args: ValidateLicenseKeyArgs,
    ) -> ValidateLicenseKeyResponse {
        let response = reqwest::Client::new()
            .post(format!("{}/licenses/validate", BACKEND_URL))
            .header("accept", "application/json")
            .header("Content-Type", "application/json")
            .json(&args)
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send validate request");

        let response = response
            .json::<ValidateLicenseKeyResponse>()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to parse validate response");

        response
    }

    async fn deactivate_license_key(
        self,
        args: DeactivateLicenseKeyArgs,
    ) -> DeactivateLicenseKeyResponse {
        let response = reqwest::Client::new()
            .post(format!("{}/licenses/deactivate", BACKEND_URL))
            .header("accept", "application/json")
            .header("Content-Type", "application/json")
            .json(&args)
            .send()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to send deactivate request");

        let response = response
            .json::<DeactivateLicenseKeyResponse>()
            .await
            .map_err(|e| e.to_string())
            .expect("Failed to parse deactivate response");

        response
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
