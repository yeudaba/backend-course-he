// עוזר לבדיקות של שאלות התרגול (E29 ואילך): מריץ את הקובץ שלך ואת הפתרון על אותם נתונים —
// על store.sql כמו שהוא, על הנתונים הנוספים של files/store.variants.sql, וגם אחרי שינויים ספציפיים לשאלה.
// כך שאילתה שמחזירה תוצאה "מועתקת" (ערכים קבועים) לא עוברת. העבודה עצמה — ב־tools/sql.mjs.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import { sameAsSolution as compare } from "../../tools/sql.mjs";

// changes: [["תיאור השינוי", "SQL שמשנה את הנתונים"], ...]
export async function sameAsSolution(t, testUrl, file, changes = [], seed = "store.sql", options = {}) {
  await compare(t, testUrl, file, { seed, changes, ...options });
}
