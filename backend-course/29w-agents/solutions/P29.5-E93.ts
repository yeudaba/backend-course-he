// P29.5-E93: טקסט התקדמות ללקוח
type Ev =
  | { type: "model"; step: number }
  | { type: "tool_start"; name: string; input: unknown }
  | { type: "tool_end"; name: string; isError: boolean }
  | { type: "done" }
  | { type: "error" };

export function progressText(ev: Ev, labels: Record<string, string>): string | null {
  switch (ev.type) {
    case "model":
      return ev.step === 1 ? "חושב…" : null;
    case "tool_start":
      return Object.hasOwn(labels, ev.name) ? labels[ev.name] : "עובד על זה…";
    case "tool_end":
      return ev.isError ? "משהו לא הצליח, מנסה דרך אחרת…" : null;
    case "done":
      return null;
    case "error":
      return "לא הצלחתי להשלים — נסה שוב או פנה לנציג";
  }
}
