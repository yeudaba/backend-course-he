-- P21-E88: expand, backfill, contract
-- 1. expand: עמודה שמותר בה NULL — לא שוברת כלום
ALTER TABLE tasks ADD COLUMN owner_id int REFERENCES users(id) ON DELETE CASCADE;

-- 2. backfill: כל המשימות הקיימות למשתמש "ישן"
UPDATE tasks
   SET owner_id = (SELECT id FROM users WHERE email = 'legacy@tasks.example')
 WHERE owner_id IS NULL;

-- 3. contract: מעכשיו חובה
ALTER TABLE tasks ALTER COLUMN owner_id SET NOT NULL;

CREATE INDEX tasks_owner_id_idx ON tasks (owner_id);
