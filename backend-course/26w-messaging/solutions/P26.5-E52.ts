// P26.5-E52: התאמה של topic binding
const words = (s: string) => (s === "" ? [] : s.split("."));

function match(p: string[], k: string[]): boolean {
  if (p.length === 0) return k.length === 0;
  const [head, ...rest] = p;
  if (head === "#") {
    for (let skip = 0; skip <= k.length; skip++) if (match(rest, k.slice(skip))) return true;
    return false;
  }
  if (k.length === 0) return false;
  return (head === "*" || head === k[0]) && match(rest, k.slice(1));
}

export function bindingMatches(pattern: string, routingKey: string) {
  return match(words(pattern), words(routingKey));
}
