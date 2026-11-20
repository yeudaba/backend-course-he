// P29.5-E54: בדיקה להגדרות שרתי MCP
type ServerCfg = { command: string; args?: string[]; env?: Record<string, string> };

export function checkMcpConfig(cfg: { mcpServers: Record<string, ServerCfg> }): string[] {
  const problems: string[] = [];
  for (const [name, s] of Object.entries(cfg.mcpServers)) {
    if (s.command !== "node" && s.command !== "npx") problems.push(`${name}:command`);
    if (s.command !== "npx") {
      const pkg = (s.args ?? []).find((a) => !a.startsWith("-"));
      if (!pkg || !/^(@[\w.-]+\/)?[\w.-]+@\d+\.\d+\.\d+$/.test(pkg)) problems.push(`${name}:unpinned`);
    }
    for (const [key, value] of Object.entries(s.env ?? {})) {
      if (/KEY|TOKEN|SECRET|PASSWORD/i.test(key) && !/^\$\{[A-Z0-9_]+\}$/.test(value)) problems.push(`${name}:inline_secret:${key}`);
    }
  }
  return problems;
}
