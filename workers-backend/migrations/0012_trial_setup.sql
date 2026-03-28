-- Set existing accounts (created before trial system) to 'active' so they are not blocked
UPDATE companies SET subscription_status = 'active' WHERE subscription_status = '' OR subscription_status IS NULL;
