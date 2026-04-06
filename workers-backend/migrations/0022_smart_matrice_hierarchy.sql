-- =============================================
-- 0022: Smart Matrice — hiérarchie infinie + champs avancés
-- =============================================

-- Hiérarchie infinie
ALTER TABLE sm_tasks ADD COLUMN parent_id INTEGER REFERENCES sm_tasks(id) ON DELETE CASCADE;
ALTER TABLE sm_tasks ADD COLUMN depth INTEGER DEFAULT 0;
ALTER TABLE sm_tasks ADD COLUMN progress REAL DEFAULT 0;
ALTER TABLE sm_tasks ADD COLUMN difficulty TEXT DEFAULT 'medium';
ALTER TABLE sm_tasks ADD COLUMN importance TEXT DEFAULT 'normal';
ALTER TABLE sm_tasks ADD COLUMN urgency TEXT DEFAULT 'normal';
ALTER TABLE sm_tasks ADD COLUMN actual_duration REAL;
ALTER TABLE sm_tasks ADD COLUMN accuracy REAL;
ALTER TABLE sm_tasks ADD COLUMN ai_recommendation TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_sm_tasks_parent ON sm_tasks(parent_id);

-- Config projet
ALTER TABLE sm_projects ADD COLUMN working_days_year INTEGER DEFAULT 260;
ALTER TABLE sm_projects ADD COLUMN days_off_year INTEGER DEFAULT 14;
ALTER TABLE sm_projects ADD COLUMN hours_per_day REAL DEFAULT 8;
ALTER TABLE sm_projects ADD COLUMN working_days_week INTEGER DEFAULT 5;
