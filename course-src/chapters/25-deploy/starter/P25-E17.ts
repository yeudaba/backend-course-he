// P25-E17: pipeline של deploy, עם rollback
export interface Steps {
  migrate(): Promise<void>;
  deploy(version: string): Promise<void>;
  smoke(version: string): Promise<boolean>;
  currentVersion(): Promise<string>;
}

export async function runPipeline(version: string, steps: Steps, log: (line: string) => void = () => {}): Promise<{ ok: boolean; running: string }> {
  await steps.migrate(); // כתוב כאן
  await steps.deploy(version);
  return { ok: true, running: version };
}
