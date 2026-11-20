// P29.5-E99: מגמה של evals במסד
type Db = { query(text: string, params?: unknown[]): Promise<{ rows: any[] }> };
type Result = { scenario: string; trials: number; passes: number };

export async function saveEvalRun(db: Db, run: { gitSha: string; results: Result[] }): Promise<number> {
  for (const r of run.results) {
    if (!Number.isInteger(r.trials) || r.trials < 1 || !Number.isInteger(r.passes) || r.passes < 0 || r.passes > r.trials) {

    }
  }
  await db.query("BEGIN");
  try {
    const { rows } = await db.query("INSERT INTO eval_runs (git_sha) VALUES ($1) RETURNING id", [run.gitSha]);
    const id: number = rows[0].id;
    for (const r of run.results) {
      await db.query("INSERT INTO eval_results (run_id, scenario, trials, passes) VALUES ($1, $2, $3, $4)", [id, r.scenario, r.trials, r.passes]);
    }
    await db.query("COMMIT");
    return id;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

export async function passRateTrend(db: Db, scenario: string, lastN: number) {
  const { rows } = await db.query(
    `SELECT r.id, r.git_sha, e.trials, e.passes
       FROM eval_runs r JOIN eval_results e ON e.run_id = r.id
      WHERE e.scenario = $1
      ORDER BY r.id DESC
      LIMIT $2`,
    [scenario, lastN],
  );
  return rows.reverse().map((r) => ({ runId: r.id, gitSha: r.git_sha, passRate: Math.round((r.passes / r.trials) * 100) / 100 }));
}
