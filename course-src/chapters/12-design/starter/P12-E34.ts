// P12-E34: טווח מספרים
// כתוב וייצא (export):
//   class Range — readonly start, end; end < start → RangeError("end קטן מ־start")
//     get length · includes(n) (כולל קצוות) · overlaps(other) · toString() → "[3, 7]"
//     static parse("3-7") → Range; טקסט לא תקין → RangeError("טווח לא תקין")
//
// הרצה:   node 12-design/starter/P12-E34.ts
// בדיקה:  npm run check P12-E34
