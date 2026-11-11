// P28-E26: quorum — כמה העתקים צריכים להסכים — מקובץ ריק
// כתוב וייצא:
//   type Replica = { up: boolean; version: number; value: string | null }
//   isStrong(n, r, w) — האם כל קריאה רואה את הכתיבה האחרונה (R + W > N)
//   quorumWrite(replicas, w, value, version) — כותבת לכל העתק זמין, מחזירה true אם לפחות w אישרו
//   quorumRead(replicas, r) → { value, version, repaired } — r הזמינים הראשונים, הגרסה הגבוהה מביניהם,
//     ו־read repair: מעדכנת את מי שנקרא עם גרסה ישנה (repaired — כמה) · פחות מ־r זמינים ← Error
//
// הרצה:   node 28-system-design/starter/P28-E26.ts
// בדיקה:  npm run check P28-E26
