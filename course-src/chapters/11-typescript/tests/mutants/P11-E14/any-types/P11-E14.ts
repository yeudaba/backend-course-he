export function groupBy(items: any[], keyFn: (item: any) => any): any {
  const result: any = {};
  for (const item of items) { const key = keyFn(item); (result[key] ??= []).push(item); }
  return result;
}
export function indexBy(items: any[], keyFn: (item: any) => any): any { return new Map(items.map((item) => [keyFn(item), item])); }
export function sumBy(items: any[], fn: (item: any) => any): any { return items.reduce((s, item) => s + fn(item), 0); }
