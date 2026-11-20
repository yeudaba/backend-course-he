// P26-E123: הודעת SSE — הדפדפן לא מקבל כלום, טקסט רב־שורות נחתך, ו־id 0 נעלם.
// id (גם 0) ו־event אם הועברו · data: מחרוזת כמו שהיא, אחרת JSON · שורת data לכל שורה · שורה ריקה בסוף
//
// בדיקה:  npm run check P26-E123
export function sseMessage({ id, event, data }: { id?: string | number; event?: string; data: unknown }): string {
  let out = "";
  if (id) out += `id: ${id}\n`;
  if (event) out += `event: ${event}\n`;
  out += `data: ${typeof data === "string" ? data : JSON.stringify(data)}\n`;
  return out;
}
