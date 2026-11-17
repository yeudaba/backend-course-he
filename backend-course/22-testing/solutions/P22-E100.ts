// P22-E100: fake fetch — routes קבועים, ורישום של כל קריאה
export type FakeReply = { status: number; body?: unknown };
type Req = { method: string; path: string; headers: Record<string, string>; body: unknown };
export type Route = FakeReply | ((req: Req) => FakeReply);

export function createFakeFetch(routes: Record<string, Route>) {
  const calls: Req[] = [];
  const fake = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input), "http://fake");
    const method = (init?.method ?? "GET").toUpperCase();
    const headers = Object.fromEntries(new Headers(init?.headers));
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const req = { method, path: url.pathname, headers, body };
    calls.push(req);
    const key = `${method} ${url.pathname}`;
    const route = routes[key];
    const reply: FakeReply = route === undefined ? { status: 404, body: { error: `אין route ל־${key}` } } : typeof route === "function" ? route(req) : route;
    if (reply.status === 204 || reply.body === undefined) return new Response(null, { status: reply.status });
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { "content-type": "application/json" } });
  };
  return Object.assign(fake as typeof fetch, { calls });
}
