// P29.5-E47: בדיקה של תיאורי כלים
type McpTool = { name: string; description?: string; inputSchema: { properties?: Record<string, unknown> } };

const RULES: [RegExp, string][] = [
  [/ignore (all |any )?(previous|prior) instructions|before (using|calling)|do not (tell|mention)|<important>|system prompt/i, "hidden_instructions"],
  [/~\/\.ssh|\.env\b|id_rsa|api[_-]?key/i, "secret_paths"],
  [/https?:\/\//i, "url"],
];

export function auditMcpTools(tools: McpTool[]) {
  const out: { tool: string; problems: string[] }[] = [];
  for (const t of tools) {
    const d = t.description ?? "";
    const problems: string[] = [];
    if (d.trim().length < 20) problems.push("short_description");
    for (const [re, code] of RULES) if (re.test(d)) problems.push(code);
    if (Object.keys(t.inputSchema.properties ?? {}).some((p) => /^(user|customer|owner)_?id$/i.test(p))) problems.push("identity_param");
    if (problems.length) out.push({ tool: t.name, problems });
  }
  return out;
}
