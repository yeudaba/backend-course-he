// P14-E51: לבחור פורמט לפי Accept
function parseAccept(accept) {
  return accept.split(",").map((part) => {
    const [type, ...params] = part.split(";").map((s) => s.trim().toLowerCase());
    let q = 1;
    for (const p of params) if (p.startsWith("q=")) q = Number(p.slice(2));
    return { type, q };
  });
}

export function chooseFormat(accept, available) {
  if (!accept || accept.trim() === "") return available[0] ?? null;
  const list = parseAccept(accept);
  let best = null;
  let bestQ = 0;
  for (const format of available) {
    const f = format.toLowerCase();
    const rule =
      list.find((r) => r.type === f) ?? list.find((r) => r.type === f.split("/")[0] + "/*") ?? list.find((r) => r.type === "*/*");
    const q = rule?.q ?? 0;
    if (q > bestQ) {
      best = format;
      bestQ = q;
    }
  }
  return best;
}

const both = ["application/json", "text/html"];
console.log(chooseFormat("text/html, application/json;q=0.9, */*;q=0.1", both));
console.log(chooseFormat("application/json", both));
console.log(chooseFormat("*/*", both));
console.log(chooseFormat("text/*;q=0.5, */*;q=0.2", both));
console.log(chooseFormat("image/png", both));
console.log(chooseFormat("*/*, application/json;q=0", both));
console.log(chooseFormat(undefined, both));
