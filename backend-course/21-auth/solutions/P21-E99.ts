// P21-E99: בודק IDOR — מה קורה כש־B נוגע במשימה של A
export type OwnershipReport = { get: number; patch: number; delete: number; stillExists: boolean; title: string };

export async function probeOwnership(baseUrl: string, tokenA: string, tokenB: string): Promise<OwnershipReport> {
  const call = (method: string, path: string, token: string, body?: unknown) =>
    fetch(baseUrl + path, {
      method,
      headers: { authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "content-type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const created = await (await call("POST", "/tasks", tokenA, { title: "של A" })).json();
  const path = `/tasks/${created.id}`;
  const get = (await call("GET", path, tokenB)).status;
  const patch = (await call("PATCH", path, tokenB, { title: "B היה כאן" })).status;
  const del = (await call("DELETE", path, tokenB)).status;
  const after = await call("GET", path, tokenA);
  const stillExists = after.status === 200;
  const title = stillExists ? (await after.json()).title : "";
  return { get, patch, delete: del, stillExists, title };
}

export function isSafe(r: OwnershipReport): boolean {
  return r.get === 404 && r.patch === 404 && r.delete === 404 && r.stillExists && r.title === "של A";
}
