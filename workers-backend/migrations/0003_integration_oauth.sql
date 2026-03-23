-- OAuth tokens for integrations that need it (Google, Microsoft)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TEXT,
  scope TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(company_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_company ON oauth_tokens(company_id);

-- Add external_id and source to accounts for sync dedup
ALTER TABLE accounts ADD COLUMN external_id TEXT;
ALTER TABLE accounts ADD COLUMN source TEXT DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_accounts_external ON accounts(company_id, external_id);

-- Note: tasks are stored as JSON in task_boards.tasks, no ALTER needed

-- Sync log to track last sync per integration
CREATE TABLE IF NOT EXISTS integration_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('success', 'error')),
  details TEXT DEFAULT '{}',
  synced_at TEXT DEFAULT (datetime('now')),
  UNIQUE(company_id, integration_key)
);
