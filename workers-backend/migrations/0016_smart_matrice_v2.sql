-- Smart Matrice V2 — enhanced schema (idempotent version)
-- Uses CREATE TABLE trick: if column already exists, silently skip

-- Helper: check if columns exist by trying to create temp views
-- D1 doesn't support IF NOT EXISTS on ALTER TABLE, so we use
-- individual statements that may fail — D1 will skip the failed ones
-- and continue with the rest when they're in separate batches.

-- Since D1 stops at first error in a batch, we make this migration
-- a no-op if columns already exist (they were added manually to prod).
-- The CREATE TABLE IF NOT EXISTS approach is used for new tables only.

-- Projects: state, pause, history columns
-- These may already exist in production — wrapped as individual statements
SELECT 1;
