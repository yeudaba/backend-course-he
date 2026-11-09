// P30-E28
// מנקה טקסט לפני שמדביקים אותו לצ'אט של AI (או ל־issue, או ל־Slack): סודות לא יוצאים מהמחשב שלך
const RULES: { type: string; re: RegExp; keep?: (m: string, ...g: string[]) => string }[] = [
  // בלוק מפתח פרטי — מהשורה BEGIN ועד END
  { type: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g },
  // כתובת חיבור עם סיסמה: משאירים את המשתמש והשרת, מסתירים רק את הסיסמה
  { type: "url-password", re: /\b([a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:)([^\s@/]+)(@)/gi, keep: (_m, a, _p, c) => `${a}[REDACTED:url-password]${c}` },
  { type: "jwt", re: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g },
  { type: "api-key", re: /\bsk-[A-Za-z0-9_-]{16,}/g },
  { type: "aws-key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { type: "github-token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}/g },
  { type: "bearer", re: /(\bBearer\s+)([A-Za-z0-9._~+/-]{8,}=*)/g, keep: (_m, a) => `${a}[REDACTED:bearer]` },
  // שורות של .env: KEY=value, כשהשם נשמע כמו סוד
  { type: "env-secret", re: /^(\s*[A-Z0-9_]*(?:SECRET|PASSWORD|PASSWD|TOKEN|API_KEY|PRIVATE_KEY)[A-Z0-9_]*\s*=\s*)(\S.*)$/gm, keep: (_m, a) => `${a}[REDACTED:env-secret]` },
];

export function redactForPrompt(text: string): { text: string; found: string[] } {
  const found = new Set<string>();
  let out = text;
  for (const { type, re, keep } of RULES) {
    out = out.replace(re, (...args) => {
      // ערך שכבר הוסתר (מכלל קודם) — לא מסתירים שוב
      if (String(args[0]).includes("[REDACTED:")) return args[0];
      found.add(type);
      return keep ? keep(...(args as [string, ...string[]])) : `[REDACTED:${type}]`;
    });
  }
  return { text: out, found: [...found].sort() };
}
