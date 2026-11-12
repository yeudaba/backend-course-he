ALTER TABLE accounts ADD COLUMN closed_at timestamptz;
CREATE UNIQUE INDEX accounts_open_owner_key ON accounts (lower(owner)) WHERE closed_at IS NULL;
