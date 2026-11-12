// P24-E101: request() של הדף — עם קוד לתמיכה
type Options = { method?: string; body?: string; headers?: Record<string, string> };

export function createApiClient({ fetchFn, base, getToken }: { fetchFn: typeof fetch; base: string; getToken: () => string | null }) {
  return async (path: string, options: Options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetchFn(base + path, { ...options, headers });
    if (res.status === 204) return undefined;
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      const message = data.error?.message ?? `HTTP ${res.status}`;
      throw new Error(res.status >= 500 ? `${message} · קוד לתמיכה: ${res.headers.get("x-request-id")}` : message);
    }
    return data;
  };
}
