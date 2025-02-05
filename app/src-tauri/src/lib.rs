use chrono::{Duration, NaiveDate, Utc};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::sqlite::SqliteConnection;
use models::{CreateHabitCompletion, Habit, UpdateHabit};
use uuid::Uuid;

mod db;
mod models;
mod schema;

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

#[taurpc::procedures(export_to = "../src/bindings.ts")]
trait Api {
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
}

#[derive(Clone)]
struct ApiImpl {
    pool: Pool<ConnectionManager<SqliteConnection>>,
}

#[taurpc::resolvers]
impl Api for ApiImpl {
    // --------------------------------------------------------------------------
    // Habits
    // --------------------------------------------------------------------------
    async fn create_habit(self, args: CreateHabitArgs) {
        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

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

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

        habits
            .filter(is_archived.eq(false))
            .order(created_at.desc())
            .load::<models::Habit>(connection)
            .expect("Error loading habits")
    }

    async fn get_archived_habits(self) -> Vec<models::Habit> {
        use crate::schema::habits::dsl::*;

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

        let results = habits
            .filter(is_archived.eq(true))
            .order(created_at.desc())
            .load::<models::Habit>(connection)
            .expect("Error loading habits");

        return results;
    }

    async fn update_habit(self, args: UpdateHabitArgs) {
        use crate::schema::habits::dsl::*;

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

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

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

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

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

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

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

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

        let connection = &mut self
            .pool
            .get()
            .expect("Failed to get a connection from the pool");

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
}

pub fn establish_connection_pool() -> Pool<ConnectionManager<SqliteConnection>> {
    db::init();

    let db_path = db::get_test_db_path();

    println!("DB path: {:?}", db_path);
    let manager: ConnectionManager<SqliteConnection> =
        ConnectionManager::<SqliteConnection>::new(db_path);

    Pool::builder()
        .build(manager)
        .expect("Failed to create pool.")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tokio::main]
pub async fn run() {
    let db_path = db::get_test_db_path();
    let manager: ConnectionManager<SqliteConnection> =
        ConnectionManager::<SqliteConnection>::new(db_path);

    let pool = Pool::builder()
        .build(manager)
        .expect("Failed to create DB pool");

    tauri::Builder::default()
        .manage(pool)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(taurpc::create_ipc_handler(
            ApiImpl {
                pool: establish_connection_pool(),
            }
            .into_handler(),
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
