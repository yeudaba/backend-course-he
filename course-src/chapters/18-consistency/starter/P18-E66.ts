// P18-E66: האם השאילתה משתמשת ב־index? — בקוד
// כתוב וייצא type PlanSummary = { nodes, seqScans, indexes } ו־
//   async function planSummary(pool, sql, params?): Promise<PlanSummary>
//   EXPLAIN (FORMAT JSON); מעבר רקורסיבי על Plan/Plans; seqScans — Relation Name של Seq Scan; indexes — בלי כפילויות
//
// בדיקה:  npm run check P18-E66
