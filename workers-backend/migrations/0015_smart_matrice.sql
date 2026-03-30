-- Smart Matrice module tables
-- Projects
CREATE TABLE IF NOT EXISTS sm_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '📁',
  status TEXT DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  color TEXT DEFAULT '#e8603a',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sm_projects_company ON sm_projects(company_id);

-- Tasks
CREATE TABLE IF NOT EXISTS sm_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES sm_projects(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  group_name TEXT DEFAULT '',
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'normal',
  quadrant INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  dur_min REAL,
  dur_max REAL,
  dur_estimated REAL,
  dur_ai REAL,
  dur_real REAL,
  assigned_to INTEGER,
  is_paused INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sm_tasks_project ON sm_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_sm_tasks_company ON sm_tasks(company_id);

-- Subtasks
CREATE TABLE IF NOT EXISTS sm_subtasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES sm_tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sm_subtasks_task ON sm_subtasks(task_id);

-- Smart Matrice config per company
CREATE TABLE IF NOT EXISTS sm_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE,
  country TEXT DEFAULT 'FR',
  company_name TEXT DEFAULT '',
  days_per_week INTEGER DEFAULT 5,
  hours_per_day REAL DEFAULT 8,
  daily_tasks TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sm_config_company ON sm_config(company_id);
