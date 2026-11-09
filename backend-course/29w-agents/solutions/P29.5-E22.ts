// P29.5-E22: שער האישורים — אחרי התיקון
export const SENSITIVE = ["refund_order", "cancel_order"];

export async function handleToolCalls(
  calls: { id: string; name: string; input: any }[],
  tools: Record<string, (input: any) => Promise<string>>,
  decisions: Record<string, "approve" | "deny">, // לפי tool_use id
) {
  return Promise.all(
    calls.map(async (c) => {
      if (SENSITIVE.includes(c.name)) {
        // תיקון 1: ההחלטה לפי id של הקריאה — אישור להחזר אחד הוא לא אישור לכל ההחזרים
        // תיקון 3: רק "approve" הוא אישור; "deny" (או חסר) — לא
        if (decisions[c.id] !== "approve") {
          return { type: "tool_result" as const, tool_use_id: c.id, content: "הפעולה לא אושרה ע״י המשתמש", is_error: true as const };
        }
      }
      // תיקון 2: מריצים רק אחרי הבדיקה
      return { type: "tool_result" as const, tool_use_id: c.id, content: await tools[c.name](c.input) };
    }),
  );
}
