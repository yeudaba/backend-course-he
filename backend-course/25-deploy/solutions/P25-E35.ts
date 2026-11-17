// P25-E35: מה נכשל? סיכום של לוג
export function summarizeLog(text: string) {
  let currentStep: string | null = null;
  let failedStep: string | null = null;
  let firstError: string | null = null;
  let errorCount = 0;
  let exitCode: number | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s/, "");
    if (line.startsWith("##[group]Run ")) currentStep = line.slice("##[group]Run ".length).trim();
    if (!line.startsWith("##[error]")) continue;
    const msg = line.slice("##[error]".length).trim();
    const exit = /^Process completed with exit code (\d+)\.$/.exec(msg);
    if (exit) {
      exitCode ??= Number(exit[1]);
      continue;
    }
    errorCount++;
    if (firstError === null) {
      firstError = msg;
      failedStep = currentStep;
    }
  }
  return { failedStep, firstError, errorCount, exitCode };
}

console.log(summarizeLog(`2026-11-07T15:40:01.1234567Z ##[group]Run npm ci
2026-11-07T15:40:08.0000000Z ##[endgroup]
2026-11-07T15:40:08.1000000Z ##[group]Run npm run typecheck
2026-11-07T15:40:10.0000000Z ##[error]src/auth/auth.schema.spec.ts(3,1): error TS2593: Cannot find name 'describe'.
2026-11-07T15:40:10.0000000Z ##[error]prisma/seed.ts(16,1): error TS1309: The current file is a CommonJS module.
2026-11-07T15:40:10.1000000Z ##[error]Process completed with exit code 2.`));
