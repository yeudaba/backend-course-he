// P15-E55: מדדים לשרת
// כתוב וייצא createMetrics(now = () => performance.now()) → { middleware, snapshot }
//   snapshot() → { total, byStatus: { "2xx": n, ... }, avgMs (מעוגל), maxMs, slowest: "METHOD originalUrl" | null }
//
// הרצה:   node 15-express/starter/P15-E55.ts
// בדיקה:  npm run check P15-E55
