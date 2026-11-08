// P25-E22
export async function smokeCheck(base: string, expectCommit: string, { attempts = 30, intervalMs = 5000 } = {}): Promise<boolean> {
  // תקלה 1: ניסיון אחד. אחרי deploy השרת עוד בונה/מתעורר — "✖" על deploy תקין
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${base}/version`);
      // תקלה 2: res.ok בלבד — הגרסה *הישנה* עונה 200 בזמן שהחדשה נבנית (או אחרי שנכשלה). בודקים את ה־commit
      if (res.ok && ((await res.json()) as { commit?: string }).commit === expectCommit) {
        // תקלה 3: גרסה שעלתה בלי מסד היא לא "תקינה" — /ready
        const ready = await fetch(`${base}/ready`);
        if (ready.ok) return true;
      }
    } catch {
      // עוד לא עונה
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
