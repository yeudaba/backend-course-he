// P30-E27: הקוד ש־AI כתב לבקשה "פונקציה שמחשבת עימוד (pagination) ל־API".
// הקוד הזה תקין. את הבדיקות כותבים ב־P30-E27.spec.ts — והבודק מריץ אותן גם על גרסאות עם באגים.

// page מתחיל מ־1. pageSize בין 1 ל־100 (ברירת מחדל 20)
export function paginate(total: number, page = 1, pageSize = 20) {
  if (!Number.isInteger(page) || page < 1) throw new RangeError("page חייב להיות מספר שלם ≥ 1");
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError("pageSize חייב להיות מספר שלם ≥ 1");
  const size = Math.min(pageSize, 100); // לא מחזירים מיליון שורות בבקשה אחת
  const totalPages = Math.ceil(total / size);
  return {
    offset: (page - 1) * size,
    limit: size,
    totalPages,
    hasNext: page < totalPages,
  };
}
