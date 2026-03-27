-- Add missing columns needed by integration sync services (HubSpot, Pipedrive, Salesforce, etc.)
-- These are separate from contact/contact_email which are for the primary contact person

ALTER TABLE accounts ADD COLUMN email TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN company_name TEXT DEFAULT '';
ALTER TABLE accounts ADD COLUMN phone TEXT DEFAULT '';
