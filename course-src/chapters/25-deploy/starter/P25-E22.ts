// P25-E22: בדיקת עשן שאומרת "✔" גם כשה־deploy נכשל, ו"✖" כשהכול בסדר. שלוש תקלות
export async function smokeCheck(base: string, expectCommit: string, { attempts = 30, intervalMs = 5000 } = {}): Promise<boolean> {
  try {
    const res = await fetch(`${base}/version`);
    return res.ok;
  } catch {
    return false;
  }
}
