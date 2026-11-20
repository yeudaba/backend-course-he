// P29.5-E55: לוג ביקורת לכלי MCP
type Result = { content: { type: "text"; text: string }[]; isError?: boolean };
type Handler<A> = (args: A) => Promise<Result>;

export function audited<A extends Record<string, unknown>>(
  tool: string,
  handler: Handler<A>,
  opts: { log: (entry: object) => void; customerId: number; now?: () => number; redact?: string[] },
): Handler<A> {
  const now = opts.now ?? Date.now;
  const hide = new Set(opts.redact ?? []);
  return async (args: A) => {
    const safeArgs = Object.fromEntries(Object.entries(args).map(([k, v]) => [k, hide.has(k) ? "[REDACTED]" : v]));
    const start = now();
    const base = { msg: "mcp_tool", tool, customerId: opts.customerId };
    try {
      const r = await handler(args);
      opts.log({ ...base, ms: now() - start, isError: r.isError !== true, args: safeArgs });
      return r;
    } catch (err) {
      opts.log({ ...base, ms: now() - start, isError: true, args: safeArgs, error: (err as Error).message });
      return { content: [{ type: "text", text: "internal error" }], isError: true };
    }
  };
}
