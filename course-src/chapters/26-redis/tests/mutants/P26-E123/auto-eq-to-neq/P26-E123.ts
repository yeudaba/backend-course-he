// P26-E123: הודעת SSE — מתוקן
export function sseMessage({ id, event, data }: { id?: string | number; event?: string; data: unknown }): string {
  let out = "";
  if (id !== undefined) out += `id: ${id}\n`;
  if (event !== undefined) out += `event: ${event}\n`;
  const text = typeof data !== "string" ? data : JSON.stringify(data);
  for (const line of text.split("\n")) out += `data: ${line}\n`;
  return out + "\n";
}
