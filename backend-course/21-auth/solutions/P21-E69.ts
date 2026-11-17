// P21-E69: fetch שמוסיף טוקן, ומרענן לבד (פעם אחת) על 401
export type Tokens = { accessToken: string; refreshToken: string };
export type TokenStore = { get(): Tokens | null; set(tokens: Tokens | null): void };

export function createAuthedFetch(baseUrl: string, store: TokenStore) {
  let inFlight: Promise<Tokens | null> | null = null;

  function send(path: string, init: RequestInit, tokens: Tokens | null): Promise<Response> {
    const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
    if (tokens) headers.authorization = `Bearer ${tokens.accessToken}`;
    return fetch(baseUrl + path, { ...init, headers });
  }

  function refreshOnce(refreshToken: string): Promise<Tokens | null> {
    inFlight ??= (async () => {
      const res = await fetch(baseUrl + "/auth/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const next: Tokens | null = res.status === 200 ? await res.json() : null;
      store.set(next);
      return next;
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  return async (path: string, init: RequestInit = {}): Promise<Response> => {
    const tokens = store.get();
    const res = await send(path, init, tokens);
    if (res.status !== 401 || !tokens || path === "/auth/refresh") return res;
    const next = await refreshOnce(tokens.refreshToken);
    if (!next) return res;
    return send(path, init, next);
  };
}
