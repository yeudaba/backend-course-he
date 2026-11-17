// P15.5-E73: API עם CORS — ראשון ונכון
// כתוב וייצא (export function ...):
//   createApp({ corsOrigins = ["http://localhost:5500"] } = {}) — Express: cors ← express.json ← x-api-key "demo-key" (401)
//   ← GET /tasks, POST /tasks { title } → 201 { id, title } / 400
//
// הרצה:   node 15w-web-bridge/starter/P15.5-E73.mjs
// בדיקה:  npm run check P15.5-E73
