// P29.5-E78: מאיפה ממשיכים
type State = { messages: { role: "user" | "assistant"; content: unknown }[]; results: Record<string, string> };
type Next = { next: "call_model" } | { next: "run_tools"; pending: string[] } | { next: "send_results" } | { next: "done" };

export function resumePoint(state: State): Next {
  const last = state.messages.at(-1);
  if (!last) throw new Error("אין הודעות במצב");
  if (last.role === "user") return { next: "call_model" };
  const blocks = Array.isArray(last.content) ? (last.content as { type: string; id?: string }[]) : [];
  const ids = blocks.filter((b) => b.type === "tool_use").map((b) => b.id as string);
  if (ids.length === 0) return { next: "done" };
  const pending = ids;
  return pending.length ? { next: "run_tools", pending } : { next: "send_results" };
}
