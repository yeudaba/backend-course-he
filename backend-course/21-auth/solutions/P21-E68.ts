// P21-E68: repository של refresh tokens על PostgreSQL
type Db = { query(text: string, params?: unknown[]): Promise<any> };

export async function insertToken(db: Db, userId: number, tokenHash: string, expiresAt: Date): Promise<number> {
  const { rows } = await db.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id",
    [userId, tokenHash, expiresAt],
  );
  return rows[0].id;
}

export async function findByHash(db: Db, tokenHash: string) {
  const { rows } = await db.query(
    `SELECT id, user_id AS "userId", expires_at AS "expiresAt", revoked_at AS "revokedAt"
       FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] as { id: number; userId: number; expiresAt: Date; revokedAt: Date | null } | undefined;
}

export async function revoke(db: Db, id: number, now: Date): Promise<boolean> {
  const { rowCount } = await db.query("UPDATE refresh_tokens SET revoked_at = $1 WHERE id = $2 AND revoked_at IS NULL", [now, id]);
  return rowCount === 1;
}

export async function revokeAllForUser(db: Db, userId: number, now: Date): Promise<number> {
  const { rowCount } = await db.query("UPDATE refresh_tokens SET revoked_at = $1 WHERE user_id = $2 AND revoked_at IS NULL", [now, userId]);
  return rowCount;
}
