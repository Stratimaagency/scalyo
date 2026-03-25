-- Add must_change_password flag for CSMs invited by managers
ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0;
