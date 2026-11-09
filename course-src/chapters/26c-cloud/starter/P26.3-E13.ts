// P26.3-E13: להעריך IAM policy — כמו ש־AWS מחליט
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

export function wildcardMatch(pattern: string, value: string, ignoreCase = false): boolean {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function evaluate(policies: Policy[], action: string, resource: string): Decision {
  throw new Error("עוד לא כתבת את הפתרון");
}
