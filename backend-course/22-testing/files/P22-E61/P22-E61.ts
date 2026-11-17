// P22-E61 — הקוד שבודקים (לא משנים אותו)
import type pg from "pg";

export type Task = { id: number; ownerId: number; title: string; status: "todo" | "in_progress" | "done"; dueDate: string | null };
const COLUMNS = `id, owner_id AS "ownerId", title, status, to_char(due_date, 'YYYY-MM-DD') AS "dueDate"`;

export class TasksRepository {
  readonly #pool: pg.Pool;
  constructor(pool: pg.Pool) {
    this.#pool = pool;
  }

  async insert(ownerId: number, data: { title: string; status?: Task["status"]; dueDate?: string | null }): Promise<Task> {
    const { rows } = await this.#pool.query(
      `INSERT INTO tasks (owner_id, title, status, due_date) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [ownerId, data.title, data.status ?? "todo", data.dueDate ?? null],
    );
    return rows[0];
  }

  // רק של הבעלים; לפי תאריך (בלי תאריך — בסוף), ואז id
  async list(ownerId: number, status?: Task["status"]): Promise<Task[]> {
    const { rows } = await this.#pool.query(
      `SELECT ${COLUMNS} FROM tasks WHERE owner_id = $1 AND ($2::text IS NULL OR status = $2) ORDER BY due_date ASC NULLS LAST, id`,
      [ownerId, status ?? null],
    );
    return rows;
  }

  // משימות שתאריך היעד שלהן לפני today, ושאינן done
  async countOverdue(ownerId: number, today: string): Promise<number> {
    const { rows } = await this.#pool.query(
      `SELECT count(*)::int AS n FROM tasks WHERE owner_id = $1 AND status <> 'done' AND due_date < $2`,
      [ownerId, today],
    );
    return rows[0].n;
  }
}
