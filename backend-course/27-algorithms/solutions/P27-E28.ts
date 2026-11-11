// P27-E28 — דחיסת רצפים (run-length encoding)
export function compress(text: string): string {
  if (/\d/.test(text)) throw new TypeError("אי אפשר לדחוס טקסט עם ספרות — לא יהיה אפשר לפתוח אותו");
  let out = "";
  let i = 0;
  while (i < text.length) {
    let j = i;
    while (j < text.length && text[j] === text[i]) j++;
    const run = j - i;
    out += run === 1 ? text[i] : `${text[i]}${run}`;
    i = j;
  }
  return out;
}

export function decompress(code: string): string {
  if (/\d/.test(code[0] ?? "")) throw new SyntaxError("קוד לא יכול להתחיל בספרה");
  let out = "";
  for (const [, ch, count] of code.matchAll(/(\D)(\d*)/g)) {
    if (count.startsWith("0")) throw new SyntaxError(`מספר לא תקין אחרי ${ch}: ${count}`);
    out += ch.repeat(count === "" ? 1 : Number(count));
  }
  return out;
}

const samples = ["aaabccdddd", "abc", "", "zzzzzzzzzzzz"];
for (const s of samples) {
  const c = compress(s);
  console.log(JSON.stringify(s), "→", JSON.stringify(c), "→", decompress(c) === s ? "✓" : "✗");
}
