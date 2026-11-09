// P29.5-E22: שער האישורים — שלוש תקלות
export const SENSITIVE = ["refund_order", "cancel_order"];

export async function handleToolCalls(
  calls: { id: string; name: string; input: any }[],
  tools: Record<string, (input: any) => Promise<string>>,
  decisions: Record<string, "approve" | "deny">, // לפי tool_use id
) {
  const approvedNames = new Set(calls.filter((c) => decisions[c.id] !== undefined).map((c) => c.name));
  return Promise.all(
    calls.map(async (c) => {
      const out = await tools[c.name](c.input);
      if (SENSITIVE.includes(c.name) && !approvedNames.has(c.name)) {
        return { type: "tool_result" as const, tool_use_id: c.id, content: "הפעולה לא אושרה ע״י המשתמש", is_error: true as const };
      }
      return { type: "tool_result" as const, tool_use_id: c.id, content: out };
    }),
  );
}
