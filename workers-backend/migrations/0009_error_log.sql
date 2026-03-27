-- Error logging table for monitoring
CREATE TABLE IF NOT EXISTS error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  status INTEGER,
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Auto-cleanup: keep only last 1000 errors
CREATE TRIGGER IF NOT EXISTS cleanup_error_log
  AFTER INSERT ON error_log
  WHEN (SELECT COUNT(*) FROM error_log) > 1000
BEGIN
  DELETE FROM error_log WHERE id IN (SELECT id FROM error_log ORDER BY id ASC LIMIT 100);
END;
