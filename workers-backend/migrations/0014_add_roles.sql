-- Add commercial and kam roles to users table
-- SQLite doesn't support ALTER TABLE to modify CHECK constraints,
-- so we need to recreate the table or drop the constraint.
-- The simplest approach for D1: create a new table, copy data, swap.

CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'csm' CHECK(role IN ('manager', 'csm', 'commercial', 'kam')),
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'dark',
  currency TEXT DEFAULT 'EUR',
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  email_verified INTEGER DEFAULT 0,
  must_change_password INTEGER DEFAULT 0,
  verification_token TEXT DEFAULT '',
  verification_expires TEXT DEFAULT '',
  assigned_csm_id INTEGER DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO users_new SELECT * FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
