// P26-E112: SSE עם heartbeat וניקוי
// כתוב וייצא sseWithHeartbeat({ intervalMs }) → { handler, active() }
//   headers של SSE + X-Accel-Buffering: no · ": connected" מיד · ": ping" כל intervalMs
//   לקוח סגר ← clearInterval, ו־active() יורד
//
// בדיקה:  npm run check P26-E112
