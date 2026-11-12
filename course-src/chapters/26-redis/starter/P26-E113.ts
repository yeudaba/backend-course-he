// P26-E113: heartbeat ל־WebSocket — ping, pong, terminate
// כתוב וייצא attachHeartbeat(wss, intervalMs) → פונקציה שעוצרת
//   חיבור חדש / pong ← "חי" · כל intervalMs: לא חי ← terminate(), אחרת "לא חי" + ping()
//
// בדיקה:  npm run check P26-E113
