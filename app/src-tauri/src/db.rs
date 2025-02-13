use diesel::{
    r2d2::{ConnectionManager, Pool},
    sqlite::SqliteConnection,
    Connection,
};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::{fs, path::PathBuf};
use tauri::{App, Manager};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

pub fn setup_db(app: &App) -> Pool<ConnectionManager<SqliteConnection>> {
    let mut path = app
        .path()
        .app_data_dir()
        .expect("Failed to get application data directory");

    println!("Setting up database at: {}", path.display());

    // Create data directory if needed
    if !path.exists() {
        fs::create_dir_all(&path).expect("Failed to create data directory");
    }

    path.push("db.sqlite");

    // Initialize database file and run migrations
    if !path.exists() {
        create_db_file(&path);
    }
    run_migrations(&path);

    // Set up connection pool
    let database_url = path.to_str().expect("Invalid database path");
    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    Pool::builder()
        .build(manager)
        .expect("Failed to create database connection pool")
}

fn create_db_file(path: &PathBuf) {
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).expect("Failed to create database directory");
        }
    }
    fs::File::create(path).expect("Failed to create database file");
}

fn run_migrations(path: &PathBuf) {
    let database_url = path.to_str().expect("Invalid database path");
    let mut connection =
        SqliteConnection::establish(database_url).expect("Failed to connect to database");
    connection
        .run_pending_migrations(MIGRATIONS)
        .expect("Failed to run database migrations");
}
