// P22-E71: mutation testing — הלב של הבודק
export type Mutant = { desc: string; replace: [from: string, to: string][] };
export type Result = { killed: string[]; survived: string[]; score: number };

export async function runMutants(
  source: string,
  mutants: Mutant[],
  runTests: (code: string) => boolean | Promise<boolean>,
): Promise<Result> {
  if (!(await runTests(source))) throw new Error("הבדיקות נכשלות על הקוד התקין");
  const killed: string[] = [];
  const survived: string[] = [];
  for (const m of mutants) {
    let code = source;
    for (const [from, to] of m.replace) {
      if (!code.includes(from)) throw new Error(`"${from}" לא נמצא (${m.desc})`);
      code = code.replace(from, () => to);
    }
    if (await runTests(code)) survived.push(m.desc);
    else killed.push(m.desc);
  }
  const score = mutants.length === 0 ? 100 : Math.round((100 * killed.length) / mutants.length);
  return { killed, survived, score };
}
