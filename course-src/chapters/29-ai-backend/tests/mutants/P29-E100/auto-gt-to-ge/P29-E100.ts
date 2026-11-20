// P29-E100: בדיקת מבנה לבקשה שיצאה
type Body = {
  model: string;
  max_tokens: number;
  system?: string | { type: "text"; text: string }[];
  tools?: { name: string; input_schema: { properties?: Record<string, unknown> } }[];
  messages: unknown[];
};

export function lintRequest(body: Body, rules: { models: string[]; maxTokens: number; untrustedTags?: string[] }): string[] {
  const problems: string[] = [];
  if (!rules.models.includes(body.model)) problems.push(`model:${body.model}`);
  if (body.max_tokens >= rules.maxTokens) problems.push("max_tokens");
  const system = typeof body.system === "string" ? body.system : (body.system ?? []).map((b) => b.text).join("\n");
  if (/\d{4}-\d{2}-\d{2}/.test(system)) problems.push("system_date");
  for (const t of body.tools ?? []) {
    if (Object.keys(t.input_schema.properties ?? {}).some((p) => /^(user|customer|owner)_?id$/i.test(p))) problems.push(`tool_user_param:${t.name}`);
  }
  for (const tag of rules.untrustedTags ?? []) {
    if (system.includes(`<${tag}>`) || system.includes(`<${tag} `)) problems.push(`untrusted_in_system:${tag}`);
  }
  return problems;
}
