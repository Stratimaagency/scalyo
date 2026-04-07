-- 0023: Smart Matrice config — colonnes manquantes
ALTER TABLE sm_config ADD COLUMN days_off_per_year INTEGER DEFAULT 25;
ALTER TABLE sm_config ADD COLUMN national_holidays INTEGER DEFAULT 10;
ALTER TABLE sm_config ADD COLUMN extra_days_off INTEGER DEFAULT 0;
ALTER TABLE sm_config ADD COLUMN company_type TEXT DEFAULT '';
ALTER TABLE sm_config ADD COLUMN contract_type TEXT DEFAULT 'full_time';
ALTER TABLE sm_config ADD COLUMN user_first_name TEXT DEFAULT '';
