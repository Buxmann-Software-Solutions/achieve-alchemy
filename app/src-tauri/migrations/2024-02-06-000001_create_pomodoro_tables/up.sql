-- Create pomodoro_cycles table
CREATE TABLE pomodoro_cycles (
    id TEXT PRIMARY KEY NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED
    focus_duration INTEGER NOT NULL DEFAULT 1500000, -- 25 minutes in ms
    short_break_duration INTEGER NOT NULL DEFAULT 300000, -- 5 minutes in ms
    long_break_duration INTEGER NOT NULL DEFAULT 900000, -- 15 minutes in ms
    sessions_until_long_break INTEGER NOT NULL DEFAULT 4,
    auto_start_breaks BOOLEAN NOT NULL DEFAULT FALSE,
    auto_start_pomodoros BOOLEAN NOT NULL DEFAULT FALSE,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    updated_at DATETIME NOT NULL
);

-- Create pomodoro_sessions table
CREATE TABLE pomodoro_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    cycle_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- FOCUS, SHORT_BREAK, LONG_BREAK
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    duration_minutes INTEGER NOT NULL,
    was_completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (cycle_id) REFERENCES pomodoro_cycles(id)
);

-- Create indexes
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at);
CREATE INDEX idx_pomodoro_sessions_cycle ON pomodoro_sessions(cycle_id);
CREATE INDEX idx_pomodoro_cycles_status ON pomodoro_cycles(status);
CREATE INDEX idx_pomodoro_cycles_started_at ON pomodoro_cycles(started_at); 