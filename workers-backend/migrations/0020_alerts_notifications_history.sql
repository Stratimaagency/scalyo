-- Health Score History
CREATE TABLE IF NOT EXISTS health_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 70,
  previous_score INTEGER,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  recorded_by INTEGER,
  notes TEXT,
  source TEXT DEFAULT 'manual'
);
CREATE INDEX IF NOT EXISTS idx_hsh_account ON health_score_history(account_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_hsh_company ON health_score_history(company_id);

-- Alert Rules
CREATE TABLE IF NOT EXISTS alert_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  metric TEXT NOT NULL DEFAULT 'health_score',
  operator TEXT NOT NULL DEFAULT 'lt',
  threshold REAL NOT NULL DEFAULT 40,
  severity TEXT NOT NULL DEFAULT 'warning',
  is_active INTEGER NOT NULL DEFAULT 1,
  notify_email INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ar_company ON alert_rules(company_id);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  rule_id INTEGER,
  severity TEXT NOT NULL DEFAULT 'warning',
  title TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  triggered_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by INTEGER
);
CREATE INDEX IF NOT EXISTS idx_alerts_company ON alerts(company_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_account ON alerts(account_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notif_company ON notifications(company_id);

-- Project archive columns
ALTER TABLE sm_projects ADD COLUMN archived_at TEXT;
ALTER TABLE sm_projects ADD COLUMN archive_reason TEXT;
