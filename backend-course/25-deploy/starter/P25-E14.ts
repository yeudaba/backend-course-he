// P25-E14: strategy.matrix — אילו jobs ירוצו?
type Value = string | number | boolean;
type Combo = Record<string, Value>;

export function expandMatrix(matrix: Record<string, Value[] | Combo[]>): Combo[] {
  return []; // כתוב כאן
}
