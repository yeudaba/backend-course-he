// P30-E40: README של פרויקט — מה חסר?
export function readmeMissing(md: string): string[] {
  const missing: string[] = [];
  const headings = md.match(/^#{2,}\s.*$/gm) ?? [];
  const blocks = md.match(/```[\s\S]*?```/g) ?? [];
  if (!/^# /m.test(md)) missing.push("title");
  if (!/https:\/\//.test(md)) missing.push("live-link");
  if (!blocks.some((b) => /^\s*(npm|docker|pnpm|node)\b/m.test(b))) missing.push("run-commands");
  if (!headings.some((h) => /decisions|החלטות/i.test(h))) missing.push("decisions");
  if (!headings.some((h) => /improve|משפר/i.test(h))) missing.push("improve");
  if (!/!\[[^\]]*\]\([^)]*actions\/workflows[^)]*\)/.test(md)) missing.push("ci-badge");
  return missing;
}
