// P29.5-E62: מה כתוב על כפתור האישור
const posInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const str = (v: unknown): v is string => typeof v === "string" && v !== "";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function approvalSummary(call: { id: string; name: string; input: Record<string, unknown> }): string {
  const i = call.input;
  let text = `${call.name} ${JSON.stringify(i)}`;
  if (call.name === "refund_order" && posInt(i.orderId) && posInt(i.amountCents)) {
    text = `החזר של ${(i.amountCents / 100).toFixed(2)} ₪ על הזמנה ${i.orderId}`;
  } else if (call.name === "cancel_order" && posInt(i.orderId)) {
    text = `ביטול הזמנה ${i.orderId}`;
  } else if (call.name === "send_email" && str(i.to) && str(i.subject)) {
    text = `מייל ל־${i.to}: "${i.subject}"`;
  }
  return esc(text);
}
