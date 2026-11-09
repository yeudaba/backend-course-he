// P26-E27
// הודעה אחת בפורמט של Server-Sent Events: שורות "שדה: ערך", ושורה ריקה בסוף
export function formatEvent({ data, event, id, retry }: { data: unknown; event?: string; id?: string | number; retry?: number }): string {
  let out = "";
  if (id !== undefined) out += `id: ${id}\n`;
  if (event !== undefined) out += `event: ${event}\n`;
  if (retry !== undefined) out += `retry: ${retry}\n`;
  const text = typeof data === "string" ? data : JSON.stringify(data);
  // ירידת שורה בתוך data הייתה מסיימת את השדה — לכן כל שורה מקבלת data: משלה, והדפדפן מחבר אותן עם \n
  for (const line of text.split(/\r\n|\r|\n/)) out += `data: ${line}\n`;
  return out + "\n"; // שורה ריקה = סוף ההודעה
}
