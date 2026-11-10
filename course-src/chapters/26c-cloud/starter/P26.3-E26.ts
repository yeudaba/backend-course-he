// P26.3-E26: label selector של Kubernetes — מקובץ ריק
// כתוב וייצא matches(labels: Record<string, string>, selector: string): boolean
//   דרישות מופרדות בפסיק (פסיק בתוך סוגריים לא מפריד) — כולן צריכות להתקיים
//   key=value / key==value · key!=value (מתאים גם כשאין key) · key in (a,b) · key notin (a,b) (מתאים גם כשאין key)
//   key (קיים) · !key (לא קיים) · selector ריק ← true · דרישה שבורה ← SyntaxError
//   שמות: אותיות, ספרות, _ . - ו־/ · ערכים: אותיות, ספרות, _ . -
//
// הרצה:   node 26c-cloud/starter/P26.3-E26.ts
// בדיקה:  npm run check P26.3-E26
