// P22-E26 — הקוד שבודקים (לא משנים אותו)
export interface Page {
  pages: number; // כמה עמודים יש בסך הכול
  offset: number; // כמה שורות לדלג (OFFSET)
  hasPrev: boolean;
  hasNext: boolean;
}

// pagination: total שורות, עמוד page (מ־1), pageSize בעמוד (1–100, ברירת מחדל 10)
export function paginate(total: number, page: number, pageSize = 10): Page {
  if (!Number.isInteger(total) || total < 0) throw new RangeError("total חייב להיות מספר שלם לא שלילי");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new RangeError("pageSize חייב להיות 1–100");
  if (!Number.isInteger(page) || page < 1) throw new RangeError("page חייב להיות מספר שלם חיובי");
  const pages = Math.ceil(total / pageSize);
  return { pages, offset: (page - 1) * pageSize, hasPrev: page > 1, hasNext: page < pages };
}
