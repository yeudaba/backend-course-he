// P30-E104: mutation testing בקטן
type Suite<T> = (impl: T) => void | Promise<void>;

export async function runMutants<T>(suite: Suite<T>, correct: T, mutants: { name: string; impl: T }[]) {
  const passes = async (impl: T) => {
    try {
      await suite(impl);
      return true;
    } catch {
      return false;
    }
  };

  const killed: string[] = [];
  const survived: string[] = [];
  for (const m of mutants) (await passes(m.impl) ? survived : killed).push(m.name);
  return { passesOnCorrect: true, killed, survived };
}
