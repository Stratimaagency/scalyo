-- Assign accounts to specific CSM users
ALTER TABLE accounts ADD COLUMN assigned_csm_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_csm ON accounts(assigned_csm_id);
