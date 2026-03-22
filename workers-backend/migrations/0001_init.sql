-- Scalyo D1 Database Schema

-- Companies (tenant)
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Starter' CHECK(plan IN ('Starter', 'Growth', 'Elite')),
  arr REAL DEFAULT 0,
  churn REAL DEFAULT 0,
  nps INTEGER DEFAULT 0,
  color TEXT DEFAULT '#7EC8B8',
  logo TEXT DEFAULT '',
  stripe_customer_id TEXT DEFAULT '',
  stripe_subscription_id TEXT DEFAULT '',
  subscription_status TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'csm' CHECK(role IN ('manager', 'csm')),
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'dark',
  currency TEXT DEFAULT 'EUR',
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  churn_alerts INTEGER DEFAULT 1,
  weekly_report INTEGER DEFAULT 1,
  wellbeing_alerts INTEGER DEFAULT 1,
  renewal_alerts INTEGER DEFAULT 1
);

-- Portfolio accounts
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  csm TEXT DEFAULT '',
  mrr REAL DEFAULT 0,
  arr REAL DEFAULT 0,
  industry TEXT DEFAULT '',
  usage INTEGER DEFAULT 70,
  health INTEGER DEFAULT 70 CHECK(health >= 0 AND health <= 100),
  risk TEXT DEFAULT 'low' CHECK(risk IN ('low', 'medium', 'critical')),
  plan TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  issues TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  onboarding_date TEXT,
  renewal_date TEXT,
  renewal TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_accounts_company ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_risk ON accounts(risk);

-- Account todos
CREATE TABLE IF NOT EXISTS account_todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_todos_account ON account_todos(account_id);

-- KPI data
CREATE TABLE IF NOT EXISTS kpi_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  kpis TEXT DEFAULT '{}',
  goals TEXT DEFAULT '{}',
  custom_kpis TEXT DEFAULT '[]',
  history TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(company_id, period)
);

CREATE INDEX IF NOT EXISTS idx_kpi_company ON kpi_data(company_id);

-- Task board (singleton per company)
CREATE TABLE IF NOT EXISTS task_boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  tasks TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Calendar events (singleton per company)
CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  events TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Wellbeing (singleton per company)
CREATE TABLE IF NOT EXISTS wellbeing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 70,
  burnout TEXT DEFAULT 'none' CHECK(burnout IN ('none', 'low', 'moderate', 'high')),
  charge INTEGER DEFAULT 70,
  trend TEXT DEFAULT '+0',
  alerts TEXT DEFAULT '[]',
  team TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Roadmap (singleton per company)
CREATE TABLE IF NOT EXISTS roadmap (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  phase TEXT DEFAULT 'Phase 1 — Launch',
  progress INTEGER DEFAULT 0,
  items TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Coach conversations
CREATE TABLE IF NOT EXISTS coach_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coach_user ON coach_conversations(user_id);

-- Feedback
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK(category IN ('bug', 'feature', 'improvement', 'other')),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  description TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedbacks(user_id);
