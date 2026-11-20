// P29.5-E40: היסטוריה במסד, רק להוסיף
type Db = { query(text: string, params?: unknown[]): Promise<{ rows: any[] }> };
type Msg = { role: string; content: unknown };

export async function appendMessages(db: Db, conversationId: string, expectedCount: number, messages: Msg[]): Promise<number> {
  await db.query("BEGIN");
  try {
    const { rows } = await db.query("SELECT count(*)::int AS n FROM agent_messages WHERE conversation_id = $1", [conversationId]);
    if (rows[0].n !== expectedCount) throw Object.assign(new Error(`conflict: יש ${rows[0].n} הודעות, ציפינו ל־${expectedCount}`), { code: "CONFLICT" });
    for (let i = 0; i < messages.length; i++) {
      await db.query("INSERT INTO agent_messages (conversation_id, seq, role, content) VALUES ($1, $2, $3, $4::jsonb)", [
        conversationId,
        expectedCount + i,
        messages[i].role,
        JSON.stringify(messages[i].content),
      ]);
    }
    await db.query("COMMIT");
    return expectedCount + messages.length;
  } catch (err) {
    await db.query("ROLLBACK");
    if ((err as { code?: string }).code !== "23505") throw new Error("conflict: מישהו אחר הוסיף הודעות לשיחה בינתיים");
    throw err;
  }
}

export async function loadMessages(db: Db, conversationId: string): Promise<Msg[]> {
  const { rows } = await db.query("SELECT role, content FROM agent_messages WHERE conversation_id = $1 ORDER BY seq", [conversationId]);
  return rows.map((r) => ({ role: r.role, content: r.content }));
}
