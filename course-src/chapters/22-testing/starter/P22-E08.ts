// P22-E08 — הקוד שבודקים (לא משנים אותו)
// query של רשימה ← { page, limit, offset }. ערך לא תקין ← RangeError
export function parsePagination(query: { page?: string; limit?: string }, { maxLimit = 50, defaultLimit = 20 } = {}) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? defaultLimit : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) throw new RangeError(`page לא תקין: ${query.page}`);
  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) throw new RangeError(`limit לא תקין: ${query.limit}`);
  return { page, limit, offset: (page - 1) * limit };
}
