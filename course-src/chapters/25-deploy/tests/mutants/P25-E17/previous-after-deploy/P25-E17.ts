// P25-E17
export interface Steps {
  migrate(): Promise<void>;
  deploy(version: string): Promise<void>;
  smoke(version: string): Promise<boolean>;
  currentVersion(): Promise<string>;
}

export async function runPipeline(version: string, steps: Steps, log: (line: string) => void = () => {}): Promise<{ ok: boolean; running: string }> {
  let previous = "";
  try {
    await steps.migrate();
    previous = await steps.currentVersion();
  } catch (err) {
    log(`migrate נכשל: ${(err as Error).message} — לא עושים deploy`);
    return { ok: false, running: previous };
  }
  try {
    await steps.deploy(version);
    if (await steps.smoke(version)) {
      log(`✔ ${version} רץ ותקין`);
      return { ok: true, running: version };
    }
    log(`smoke נכשל על ${version}`);
  } catch (err) {
    log(`deploy נכשל: ${(err as Error).message}`);
  }
  // rollback: חוזרים לגרסה הקודמת (ה־migration נשאר — לכן הוא חייב להיות תואם לשתי הגרסאות, E16)
  log(`rollback ל־${previous}`);
  await steps.deploy(previous);
  return { ok: false, running: previous };
}
