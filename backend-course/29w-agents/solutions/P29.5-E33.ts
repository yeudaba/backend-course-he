// P29.5-E33: מ־stop_reason לפעולה הבאה
import type Anthropic from "@anthropic-ai/sdk";

type Next =
  | { action: "run_tools"; calls: { id: string; name: string; input: unknown }[] }
  | { action: "done"; text: string }
  | { action: "continue" }
  | { action: "truncated" }
  | { action: "refused"; category: string | null };

export function nextAction(msg: Anthropic.Message): Next {
  switch (msg.stop_reason) {
    case "tool_use":
      return {
        action: "run_tools",
        calls: msg.content
          .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
          .map((b) => ({ id: b.id, name: b.name, input: b.input })),
      };
    case "end_turn":
    case "stop_sequence": {
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      return { action: "done", text };
    }
    case "pause_turn":
      return { action: "continue" };
    case "max_tokens":
      return { action: "truncated" };
    case "refusal": {
      const details = (msg as { stop_details?: { category?: string | null } | null }).stop_details;
      return { action: "refused", category: details?.category ?? null };
    }
    default:
      throw new Error(`stop_reason לא מוכר: ${msg.stop_reason}`);
  }
}
