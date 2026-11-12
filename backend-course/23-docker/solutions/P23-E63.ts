// P23-E63: lint ל־Dockerfile
type Step = { cmd: string; args: string; stage: number };

function parse(text: string): Step[] {
  const out: Step[] = [];
  let stage = -1;
  for (const raw of text.replace(/\\\r?\n/g, " ").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(\w+)\s+(.*)$/.exec(line);
    if (!m) continue;
    const cmd = m[1].toUpperCase();
    if (cmd === "FROM") stage++;
    out.push({ cmd, args: m[2].trim(), stage });
  }
  return out;
}

export function lintDockerfile(text: string): string[] {
  const steps = parse(text);
  const out: string[] = [];
  const froms = steps.filter((s) => s.cmd === "FROM").map((s) => s.args.split(/\s+/)[0]);
  if (froms.some((img) => (!img.includes(":") && !img.includes("@")) || img.endsWith(":latest"))) out.push("FROM בלי tag");
  if (steps.some((s) => s.cmd === "RUN" && /npm install\b/.test(s.args))) out.push("npm install במקום npm ci");
  const lastStage = Math.max(...steps.map((s) => s.stage));
  for (let st = 0; st <= lastStage; st++) {
    const inStage = steps.filter((s) => s.stage === st);
    const copyAll = inStage.findIndex((s) => s.cmd === "COPY" && /^\.\s+\.\/?$/.test(s.args));
    const install = inStage.findIndex((s) => s.cmd === "RUN" && /npm (ci|install)\b/.test(s.args));
    if (copyAll !== -1 && install !== -1 && copyAll < install) {
      out.push("COPY . . לפני התקנת התלויות");
      break;
    }
  }
  for (const s of steps) {
    if (s.cmd !== "ENV" && s.cmd !== "ARG") continue;
    const name = s.args.split(/[=\s]/)[0];
    if (/SECRET|PASSWORD|TOKEN|KEY/i.test(name)) out.push(`סוד ב־ENV או ARG: ${name}`);
  }
  if (!steps.some((s) => s.cmd === "USER" && s.stage === lastStage)) out.push("אין USER — רץ כ־root");
  const cmd = steps.filter((s) => s.cmd === "CMD").at(-1);
  if (cmd && !cmd.args.startsWith("[")) out.push("CMD בצורת מחרוזת");
  return out;
}
