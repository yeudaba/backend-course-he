// P29-E101: קריאת פלט מובנה — גדר ← 500, קטגוריה מומצאת עוברת, ושדות מיותרים נכנסים למסד.
// JSON מתוך גדר, או מ־{ ראשון עד } אחרון · category ∈ billing|shipping|other · confidence ∈ [0, 1]
// ← { ok: true, value: { category, confidence } } או { ok: false, error } — בלי לזרוק
//
// בדיקה:  npm run check P29-E101
export function parseClassification(text: string) {
  const data = JSON.parse(text);
  if (!data.category) return { ok: false, error: "חסר category" };
  return { ok: true, value: data };
}
