-- Playbooks
CREATE TABLE IF NOT EXISTS playbooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📋',
  type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  trigger_condition TEXT DEFAULT '',
  total_days INTEGER DEFAULT 30,
  clients TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  status TEXT DEFAULT 'active',
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_playbooks_company ON playbooks(company_id);

-- Playbook Progress
CREATE TABLE IF NOT EXISTS playbook_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  playbook_id INTEGER NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  done INTEGER DEFAULT 1,
  completed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(company_id, playbook_id, step_index)
);
CREATE INDEX IF NOT EXISTS idx_pb_progress_company ON playbook_progress(company_id);

-- OKRs
CREATE TABLE IF NOT EXISTS okrs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  emoji TEXT DEFAULT '🎯',
  period TEXT DEFAULT '',
  owner TEXT DEFAULT '',
  key_results TEXT DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_okrs_company ON okrs(company_id);
