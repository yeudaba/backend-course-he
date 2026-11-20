// P22-E55: invalidCases — גוף תקין עם שדה אחד שגוי בכל פעם
export function invalidCases(valid: Record<string, unknown>, bad: Record<string, unknown[]>) {
  const cases: { name: string; body: Record<string, unknown> }[] = [];
  for (const [field, values] of Object.entries(bad)) {

    const { [field]: _, ...rest } = valid;
    cases.push({ name: `בלי ${field}`, body: rest });
    for (const v of values) cases.push({ name: `${field} = ${JSON.stringify(v)}`, body: { ...valid, [field]: v } });
  }
  return cases;
}
