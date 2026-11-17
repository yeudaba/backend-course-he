// P26.3-E41: סורק סודות לפני commit
const RULES: { kind: string; re: RegExp }[] = [
  { kind: "aws-access-key", re: /\b((?:AKIA|ASIA)[0-9A-Z]{16})\b/g },
  { kind: "aws-secret-key", re: /aws_secret_access_key\s*[=:]\s*["']?([A-Za-z0-9/+=]{40})(?![A-Za-z0-9/+=])/gi },
  { kind: "github-token", re: /\b(ghp_[A-Za-z0-9]{36})\b/g },
];

export function findSecrets(text: string) {
  const out: { line: number; kind: string; preview: string }[] = [];
  text.split(/\r?\n/).forEach((lineText, i) => {
    const found: { at: number; kind: string; secret: string }[] = [];
    for (const { kind, re } of RULES) {
      for (const m of lineText.matchAll(re)) found.push({ at: m.index! + m[0].indexOf(m[1]), kind, secret: m[1] });
    }
    found.sort((a, b) => a.at - b.at);
    for (const f of found) out.push({ line: i + 1, kind: f.kind, preview: `${f.secret.slice(0, 4)}…` });
  });
  return out;
}
