// טבלת jobs משותפת ל־E14 ול־E22
export async function seedJobs(db, n) {
  await db.query("CREATE TABLE jobs (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, status ENUM('queued','running','done') NOT NULL DEFAULT 'queued', locked_by VARCHAR(50) NULL)");
  await db.query(`INSERT INTO jobs (status) VALUES ${Array.from({ length: n }, () => "('queued')").join(",")}`);
}
