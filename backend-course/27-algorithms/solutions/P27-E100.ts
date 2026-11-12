// P27-E100: האם האינדקס ישמש? — כלל הקידומת
export function indexUsage(index: string[], query: { equals: string[]; range?: string; orderBy?: string }) {
  const eq = new Set(query.equals);
  let i = 0;
  while (i < index.length && eq.has(index[i])) i++;
  let columns = i;
  const next = index[i];
  if (next !== undefined && next === query.range) columns++;
  const sortFromIndex = query.orderBy !== undefined && next === query.orderBy;
  return { usable: columns > 0, columns, sortFromIndex };
}
