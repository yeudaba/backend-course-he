// P28.5-E51: JSON ענק בחתיכות
export function* jsonArrayChunks(items: unknown[], perChunk = 500): Generator<string> {
  if (items.length === 0) {
    yield "[]";
    return;
  }
  for (let i = 0; i <= items.length; i += perChunk) {
    const body = items.slice(i, i + perChunk).map((x) => JSON.stringify(x) ?? "null").join(",");
    const last = i + perChunk >= items.length;
    yield (i === 0 ? "[" : ",") + body + (last ? "]" : "");
  }
}
