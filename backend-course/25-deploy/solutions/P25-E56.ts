// P25-E56: להסוות סוד בלוג — בכל הצורות
export function maskLog(text: string, secrets: string[]): string {
  const forms = new Set<string>();
  for (const s of secrets) {
    if (s.length < 4) continue;
    forms.add(s);
    forms.add(Buffer.from(s).toString("base64"));
    forms.add(Buffer.from(s).toString("base64url"));
    forms.add(encodeURIComponent(s));
  }
  let out = text;
  for (const f of [...forms].sort((a, b) => b.length - a.length)) out = out.split(f).join("***");
  return out;
}

const token = "s3cr3t/deploy+key=1";
console.log(maskLog(`token=${token}\nbase64: ${Buffer.from(token).toString("base64")}\nurl: ?k=${encodeURIComponent(token)}\nshort: abc`, [token, "abc"]));
