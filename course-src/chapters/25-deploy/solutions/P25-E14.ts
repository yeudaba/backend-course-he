// P25-E14
type Value = string | number | boolean;
type Combo = Record<string, Value>;

export function expandMatrix(matrix: Record<string, Value[] | Combo[]>): Combo[] {
  const { include = [], exclude = [], ...axes } = matrix as { include?: Combo[]; exclude?: Combo[] } & Record<string, Value[]>;
  // 1. מכפלה קרטזית של כל הצירים, לפי הסדר
  let combos: Combo[] = [{}];
  for (const [key, values] of Object.entries(axes)) {
    combos = combos.flatMap((c) => values.map((v) => ({ ...c, [key]: v })));
  }
  if (Object.keys(axes).length === 0) combos = [];
  // 2. exclude: מוחק כל שילוב שמתאים לכל השדות שב־exclude
  const matches = (c: Combo, partial: Combo) => Object.entries(partial).every(([k, v]) => c[k] === v);
  combos = combos.filter((c) => !exclude.some((e) => matches(c, e)));
  // 3. include: מוסיף שדות לשילובים קיימים שמתאימים בצירים המקוריים — ואם אין כאלה, שילוב חדש
  const axisKeys = new Set(Object.keys(axes));
  for (const inc of include) {
    const original = Object.fromEntries(Object.entries(inc).filter(([k]) => axisKeys.has(k)));
    const targets = combos.filter((c) => matches(c, original) && Object.entries(inc).every(([k, v]) => axisKeys.has(k) || !(k in c) || c[k] === v));
    if (targets.length > 0 && Object.keys(original).length > 0) targets.forEach((c) => Object.assign(c, inc));
    else combos.push({ ...inc });
  }
  return combos;
}
