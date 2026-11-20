// P30-E97: מספר עמודים — הפעם נכון
function check(n: number, pageSize: number) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`ערך לא תקין: ${n}`);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize >= 100) throw new RangeError(`pageSize לא תקין: ${pageSize}`);
}

export function totalPages(total: number, pageSize: number): number {
  check(total, pageSize);
  return Math.ceil(total / pageSize);
}

export function pageOf(index: number, pageSize: number): number {
  check(index, pageSize);
  return Math.floor(index / pageSize) + 1;
}
