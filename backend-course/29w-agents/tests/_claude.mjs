// "Claude מדומה" לבודקים של פרק 29: לקוח אמיתי של @anthropic-ai/sdk, אבל fetch שלא יוצא לרשת.
// כל בקשה נשמרת (requests), והתשובה באה מ־respond(body, index): הודעה, או { error: status }.
// ככה הקוד שלך משתמש ב־SDK האמיתי — והבודק רואה בדיוק מה נשלח.
import Anthropic from "@anthropic-ai/sdk";

let nextId = 1;

export function message(content, { stop_reason = "end_turn", usage = {}, model = "claude-opus-5-5" } = {}) {
  const blocks = (Array.isArray(content) ? content : [content]).map((b) => (typeof b === "string" ? { type: "text", text: b } : b));
  return {
    id: `msg_${nextId++}`,
    type: "message",
    role: "assistant",
    model,
    content: blocks,
    stop_reason,
    stop_sequence: null,
    stop_details: null,
    usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, ...usage },
  };
}

export const toolUse = (name, input, id = `toolu_${nextId++}`) => ({ type: "tool_use", id, name, input });
export const thinking = () => ({ type: "thinking", thinking: "", signature: "sig" });

const ERROR_TYPES = { 400: "invalid_request_error", 401: "authentication_error", 429: "rate_limit_error", 500: "api_error", 529: "overloaded_error" };

export function fakeClaude(respond, { maxRetries = 0 } = {}) {
  const requests = [];
  const client = new Anthropic({
    apiKey: "sk-test-fake",
    maxRetries,
    fetch: async (url, init) => {
      const body = JSON.parse(init.body);
      requests.push({ url: String(url), body, headers: Object.fromEntries(new Headers(init.headers)) });
      const r = await respond(body, requests.length - 1);
      if (r && r.error) {
        return new Response(JSON.stringify({ type: "error", error: { type: ERROR_TYPES[r.error] ?? "api_error", message: r.message ?? "fake error" } }), {
          status: r.error,
          headers: { "content-type": "application/json", "retry-after": "0" },
        });
      }
      return Response.json(r);
    },
  });
  return { client, requests, bodies: () => requests.map((r) => r.body) };
}

// טקסט של הודעת user (string, או בלוקים)
export const userText = (m) => (typeof m.content === "string" ? m.content : m.content.filter((b) => b.type === "text").map((b) => b.text).join(""));
