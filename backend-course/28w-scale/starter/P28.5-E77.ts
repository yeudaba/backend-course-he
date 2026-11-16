// P28.5-E77: למה עמודה נדחסת: dictionary ו־RLE
// כתוב וייצא:
//   export function toColumns(rows: Record<string, unknown>[]): Record<string, unknown[]>
//   export function encodeColumn<T>(values: T[]): { dict: T[]; runs: [number, number][] }
//   export function decodeColumn<T>(enc: { dict: T[]; runs: [number, number][] }): T[]
//
// בדיקה:  npm run check P28.5-E77
