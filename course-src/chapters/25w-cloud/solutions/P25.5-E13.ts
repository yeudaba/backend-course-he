// P25.5-E13: להעריך IAM policy — כמו ש־AWS מחליט
export interface Statement {
  Effect: "Allow" | "Deny";
  Action: string | string[];
  Resource: string | string[];
}
export interface Policy {
  Version: string;
  Statement: Statement[];
}
export type Decision = "allow" | "explicit-deny" | "implicit-deny";

const list = (x: string | string[]) => (Array.isArray(x) ? x : [x]);

export function wildcardMatch(pattern: string, value: string, ignoreCase = false): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, ignoreCase ? "i" : "").test(value);
}

export function evaluate(policies: Policy[], action: string, resource: string): Decision {
  let allowed = false;
  for (const p of policies) {
    for (const s of p.Statement) {
      const hit =
        list(s.Action).some((a) => wildcardMatch(a, action, true)) && // שמות פעולות לא רגישים לרישיות
        list(s.Resource).some((r) => wildcardMatch(r, resource)); // ARN רגיש
      if (!hit) continue;
      if (s.Effect === "Deny") return "explicit-deny"; // Deny מפורש מנצח תמיד
      allowed = true;
    }
  }
  return allowed ? "allow" : "implicit-deny";
}
