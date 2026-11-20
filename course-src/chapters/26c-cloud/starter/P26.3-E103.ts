// P26.3-E103: מיזוג values כמו Helm — משנה את ה־base, מחבר מערכים, ולא מוחק על null.
// אובייקט רגיל ← לעומק · מערך / ערך פשוט ← מחליף · null ← מוחק · base ו־override לא משתנים
//
// בדיקה:  npm run check P26.3-E103
type Values = Record<string, unknown>;

export function mergeValues(base: Values, override: Values): Values {
  const out = base;
  for (const [key, value] of Object.entries(override)) {
    if (typeof value === "object" && value !== null && typeof out[key] === "object" && out[key] !== null) {
      out[key] = mergeValues(out[key] as Values, value as Values);
    } else {
      out[key] = value;
    }
  }
  return out;
}
