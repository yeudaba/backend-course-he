// P26-E111: לפרק זרם SSE
type Event = { event: string; data: string; id?: string };

export function parseSSE(text: string): Event[] {
  const out: Event[] = [];
  let data: string[] = [];
  let event = "";
  let id: string | undefined;
  const lines = text.split(/\r\n|\r|\n/);
  lines.pop(); // מה שאחרי ירידת השורה האחרונה — שורה שעוד לא הסתיימה (או ריק)
  for (const line of lines) {
    if (line === "") {
      if (data.length) out.push({ event: event || "message", data: data.join("\n"), ...(id !== undefined ? { id } : {}) });
      data = [];
      event = "";
      id = undefined;
      continue;
    }
    if (line.startsWith(":")) continue;
    const i = line.indexOf(":");
    const field = i === -1 ? line : line.slice(0, i);
    let value = i === -1 ? "" : line.slice(i + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "data") data.push(value);
    else if (field === "event") event = value;
    else if (field === "id") id = value;
  }
  return out;
}
