// P24-E106: בדיקת עשן ל־Idempotency-Key
export async function idempotencySmoke(base: string, token: string, key: string) {
  const post = async (body: unknown) => {
    const res = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { id?: unknown } | null;
    return { status: res.status, headers: res.headers, json };
  };
  const a = await post({ title: "smoke" });
  const b = await post({ title: "smoke" });
  const c = await post({ title: "smoke-2" });
  const replayed = b.headers.get("idempotent-replayed") === "true";
  const sameId = a.json?.id !== undefined && a.json.id === b.json?.id;
  const ok = a.status === 201 && b.status === 201 && replayed && sameId && c.status === 422;
  return { first: a.status, second: b.status, replayed, sameId, reused: c.status, ok };
}
