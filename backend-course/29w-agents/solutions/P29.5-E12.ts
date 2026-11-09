// P29.5-E12: tracing לסוכן — כל קריאה למודל וכל כלי: זמן, טוקנים ועלות
import type Anthropic from "@anthropic-ai/sdk";

export interface Price {
  input: number; // $ למיליון טוקנים
  output: number;
  cacheRead: number;
}
export const PRICES: Record<string, Price> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01 },
};

export interface ModelSpan {
  kind: "model";
  step: number;
  model: string;
  stopReason: string | null;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  costUsd: number;
  ms: number;
}
export interface ToolSpan {
  kind: "tool";
  name: string;
  ms: number;
  isError: boolean;
}

export function createTracer(prices: Record<string, Price> = PRICES) {
  const spans: (ModelSpan | ToolSpan)[] = [];
  let step = 0;
  const round = (x: number) => Math.round(x * 1e6) / 1e6;
  return {
    spans,
    // עוטף את client.messages.create בלי לשנות את הקוד שקורא לו
    wrapClient(client: Anthropic): Anthropic {
      const create = client.messages.create.bind(client.messages);
      const messages = Object.create(client.messages);
      messages.create = async (params: any, opts?: any) => {
        const t0 = performance.now();
        const res = (await create(params, opts)) as Anthropic.Message;
        const p = prices[params.model];
        if (!p) throw new Error(`אין מחיר למודל ${params.model}`);
        const u = res.usage;
        const cacheRead = u.cache_read_input_tokens ?? 0;
        spans.push({
          kind: "model",
          step: ++step,
          model: params.model,
          stopReason: res.stop_reason,
          inputTokens: u.input_tokens,
          outputTokens: u.output_tokens,
          cacheReadTokens: cacheRead,
          costUsd: round((u.input_tokens * p.input + u.output_tokens * p.output + cacheRead * p.cacheRead) / 1e6),
          ms: Math.round(performance.now() - t0),
        });
        return res;
      };
      return new Proxy(client, { get: (t, k) => (k === "messages" ? messages : Reflect.get(t, k)) });
    },
    wrapTool<I>(name: string, run: (input: I) => Promise<string>) {
      return async (input: I) => {
        const t0 = performance.now();
        try {
          const out = await run(input);
          spans.push({ kind: "tool", name, ms: Math.round(performance.now() - t0), isError: false });
          return out;
        } catch (err) {
          spans.push({ kind: "tool", name, ms: Math.round(performance.now() - t0), isError: true });
          throw err;
        }
      };
    },
    summary() {
      const m = spans.filter((s): s is ModelSpan => s.kind === "model");
      const t = spans.filter((s): s is ToolSpan => s.kind === "tool");
      return {
        steps: m.length,
        toolCalls: t.length,
        toolErrors: t.filter((x) => x.isError).length,
        inputTokens: m.reduce((s, x) => s + x.inputTokens, 0),
        outputTokens: m.reduce((s, x) => s + x.outputTokens, 0),
        costUsd: round(m.reduce((s, x) => s + x.costUsd, 0)),
      };
    },
  };
}
