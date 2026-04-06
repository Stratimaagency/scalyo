-- =============================================
-- 0021: Quotes légaux + country sur companies
-- =============================================

-- Ajouter country à la table companies
ALTER TABLE companies ADD COLUMN country TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN legal_name TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN registration_number TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN vat_number TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN address TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN city TEXT DEFAULT '';
ALTER TABLE companies ADD COLUMN postal_code TEXT DEFAULT '';

-- Étendre la table quotes avec les champs légaux
ALTER TABLE quotes ADD COLUMN quote_number TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN customer_name TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN customer_email TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN customer_address TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN customer_vat TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN issue_date TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN validity_days INTEGER DEFAULT 30;
ALTER TABLE quotes ADD COLUMN payment_terms TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN currency TEXT DEFAULT 'EUR';
ALTER TABLE quotes ADD COLUMN subtotal REAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN discount_pct REAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN tax_rate REAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN tax_amount REAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN total_ttc REAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN conditions TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN country TEXT DEFAULT '';

-- Lignes de devis (produits/services)
CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  tax_rate REAL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Configuration devis par entreprise (liée au pays)
CREATE TABLE IF NOT EXISTS quote_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  country TEXT NOT NULL DEFAULT 'FR',
  quote_prefix TEXT DEFAULT 'DEV',
  next_number INTEGER DEFAULT 1,
  default_validity_days INTEGER DEFAULT 30,
  default_payment_terms TEXT DEFAULT 'Net 30',
  default_tax_rate REAL DEFAULT 20,
  default_conditions TEXT DEFAULT '',
  legal_mentions TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
