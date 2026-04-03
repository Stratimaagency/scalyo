-- CRM fields for accounts
ALTER TABLE accounts ADD COLUMN phone TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN website TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN address TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN company_size TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE accounts ADD COLUMN contract_start TEXT;
ALTER TABLE accounts ADD COLUMN contract_end TEXT;
ALTER TABLE accounts ADD COLUMN contract_value REAL DEFAULT 0;
ALTER TABLE accounts ADD COLUMN logo_url TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN contacts TEXT DEFAULT '[]';
ALTER TABLE accounts ADD COLUMN interactions TEXT DEFAULT '[]';
ALTER TABLE accounts ADD COLUMN nps INTEGER;
ALTER TABLE accounts ADD COLUMN last_contact_date TEXT;
