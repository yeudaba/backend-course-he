// P12-E27: Money — אובייקט ערך (שומר אגורות שלמות, immutable)
// כתוב וייצא class Money:
//   private constructor(agorot: number)
//   static fromAgorot(agorot)   — לא מספר שלם → RangeError("סכום באגורות חייב להיות מספר שלם")
//   static fromShekels(shekels) — מעגלת לאגורה (19.9 → 1990); NaN/Infinity → אותה RangeError
//   get agorot()
//   plus(other), times(factor)  — מחזירות Money חדש (times מעגלת לאגורה)
//   equals(other)
//   toString() → "₪1,234.50" (פסיק כל 3 ספרות), שלילי: "-₪5.00"
//
// הרצה:   node 12-design/starter/P12-E27.ts
// בדיקה:  npm run check P12-E27
