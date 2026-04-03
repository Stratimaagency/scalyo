-- COPIL Sessions — each session is a presentation being prepared
CREATE TABLE IF NOT EXISTS copil_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouveau COPIL',
  client_name TEXT DEFAULT '',
  client_id INTEGER,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'in_progress', 'ready', 'presented')),
  presentation_date TEXT,
  period TEXT DEFAULT '',
  brand_color TEXT DEFAULT '#3b82f6',
  brand_color_secondary TEXT DEFAULT '#1e3a5f',
  sections TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  collaborators TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_copil_company ON copil_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_copil_user ON copil_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_copil_status ON copil_sessions(status);
