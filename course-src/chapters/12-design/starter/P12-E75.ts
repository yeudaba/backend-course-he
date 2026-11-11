// P12-E75: סינון מוצרים מה־URL
// כתוב וייצא (export):
//   class ValidationError extends Error — constructor(field, message); readonly field; name נכון
//   parseFilters(query: Record<string, string | undefined>): { minPrice?; maxPrice?; tags: string[]; inStock: boolean }
//     min/max: חסר/ריק → לא בתוצאה; אחרת /^\d+(\.\d+)?$/ → מספר; אחרת (<שדה>, "<שדה> לא תקין")
//     min > max → ("minPrice", "minPrice גדול מ־maxPrice")
//     tags: "a, B,,c" → ["a", "b", "c"] (בלי ריקים וכפילויות) · inStock: "true"/"false"/חסר, אחרת שגיאה
//
// הרצה:   node 12-design/starter/P12-E75.ts
// בדיקה:  npm run check P12-E75
