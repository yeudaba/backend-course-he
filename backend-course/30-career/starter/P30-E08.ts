// P30-E08: findSecrets — סריקת סודות לפני שה־repo הופך לציבורי
export interface Finding {
  path: string;
  line: number; // 0 = הקובץ כולו (למשל .env)
  kind: "env-file" | "anthropic-key" | "aws-key" | "private-key" | "db-password" | "jwt-secret";
}

export function findSecrets(files: readonly { path: string; content: string }[]): Finding[] {
  throw new Error("עוד לא כתבת את הפתרון");
}
