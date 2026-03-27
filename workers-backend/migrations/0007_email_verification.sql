-- Add email verification support
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN verification_expires TEXT DEFAULT '';

-- Existing users are considered verified
UPDATE users SET email_verified = 1;
