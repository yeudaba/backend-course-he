// P21-E79: repository עם בעלות בכל שאילתה
type Db = { query(text: string, params?: unknown[]): Promise<any> };
type Note = { id: number; title: string; body: string };

export async function listNotes(db: Db, ownerId: number): Promise<Note[]> {
  const { rows } = await db.query("SELECT id, title, body FROM notes WHERE owner_id = $1 ORDER BY id", [ownerId]);
  return rows;
}

export async function findNote(db: Db, ownerId: number, id: number): Promise<Note | undefined> {
  const { rows } = await db.query("SELECT id, title, body FROM notes WHERE id = $1 AND owner_id = $2", [id, ownerId]);
  return rows[0];
}

export async function updateNote(db: Db, ownerId: number, id: number, changes: { title?: string; body?: string }): Promise<Note | undefined> {
  const { rows } = await db.query(
    `UPDATE notes SET title = COALESCE($3, title), body = COALESCE($4, body)
      WHERE id = $1 AND owner_id = $2 RETURNING id, title, body`,
    [id, ownerId, changes.title ?? null, changes.body ?? null],
  );
  return rows[0];
}

export async function deleteNote(db: Db, ownerId: number, id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM notes WHERE id = $1 AND owner_id = $2", [id, ownerId]);
  return rowCount === 1;
}
