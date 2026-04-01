-- Smart Matrice V2 — enhanced schema
-- Run AFTER 0015_smart_matrice.sql

-- === PROJECTS: add state, pause, history ===
ALTER TABLE sm_projects ADD COLUMN state TEXT DEFAULT 'active';
-- state: active, priority, pending, waiting, important, difficult, urgent, not_urgent, done
ALTER TABLE sm_projects ADD COLUMN is_paused INTEGER DEFAULT 0;
ALTER TABLE sm_projects ADD COLUMN paused_at TEXT;
ALTER TABLE sm_projects ADD COLUMN total_paused_days REAL DEFAULT 0;
ALTER TABLE sm_projects ADD COLUMN history TEXT DEFAULT '[]';
-- history: JSON array of { date, action, details, user_id }
ALTER TABLE sm_projects ADD COLUMN target_end_date TEXT;
ALTER TABLE sm_projects ADD COLUMN actual_end_date TEXT;

-- === TASKS: add history, dependencies, referent, repetitive, pause ===
ALTER TABLE sm_tasks ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE sm_tasks ADD COLUMN history TEXT DEFAULT '[]';
ALTER TABLE sm_tasks ADD COLUMN referent_id INTEGER;
ALTER TABLE sm_tasks ADD COLUMN referent_name TEXT DEFAULT '';
ALTER TABLE sm_tasks ADD COLUMN depends_on INTEGER;
-- depends_on: task_id this task is waiting for
ALTER TABLE sm_tasks ADD COLUMN waiting_for TEXT DEFAULT '';
-- waiting_for: free text "waiting for client approval"
ALTER TABLE sm_tasks ADD COLUMN paused_at TEXT;
ALTER TABLE sm_tasks ADD COLUMN total_paused_hours REAL DEFAULT 0;
ALTER TABLE sm_tasks ADD COLUMN is_repetitive INTEGER DEFAULT 0;
ALTER TABLE sm_tasks ADD COLUMN cycle_count INTEGER DEFAULT 0;
ALTER TABLE sm_tasks ADD COLUMN actual_end_date TEXT;

-- === SUBTASKS: add same variables as tasks ===
ALTER TABLE sm_subtasks ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE sm_subtasks ADD COLUMN status TEXT DEFAULT 'todo';
ALTER TABLE sm_subtasks ADD COLUMN priority TEXT DEFAULT 'normal';
ALTER TABLE sm_subtasks ADD COLUMN start_date TEXT;
ALTER TABLE sm_subtasks ADD COLUMN end_date TEXT;
ALTER TABLE sm_subtasks ADD COLUMN dur_min REAL;
ALTER TABLE sm_subtasks ADD COLUMN dur_max REAL;
ALTER TABLE sm_subtasks ADD COLUMN dur_estimated REAL;
ALTER TABLE sm_subtasks ADD COLUMN dur_real REAL;
ALTER TABLE sm_subtasks ADD COLUMN assigned_to INTEGER;
ALTER TABLE sm_subtasks ADD COLUMN is_paused INTEGER DEFAULT 0;
ALTER TABLE sm_subtasks ADD COLUMN referent_name TEXT DEFAULT '';
ALTER TABLE sm_subtasks ADD COLUMN waiting_for TEXT DEFAULT '';

-- === CONFIG: add country-specific data ===
ALTER TABLE sm_config ADD COLUMN days_off_per_year INTEGER DEFAULT 25;
ALTER TABLE sm_config ADD COLUMN national_holidays INTEGER DEFAULT 11;
ALTER TABLE sm_config ADD COLUMN extra_days_off INTEGER DEFAULT 0;
ALTER TABLE sm_config ADD COLUMN company_type TEXT DEFAULT '';
ALTER TABLE sm_config ADD COLUMN contract_type TEXT DEFAULT 'full_time';
ALTER TABLE sm_config ADD COLUMN user_first_name TEXT DEFAULT '';
