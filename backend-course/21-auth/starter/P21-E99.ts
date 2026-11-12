// P21-E99: בודק IDOR
// כתוב וייצא type OwnershipReport = { get, patch, delete, stillExists, title }
//   probeOwnership(baseUrl, tokenA, tokenB): A יוצר POST /tasks { title: "של A" }; B: GET, PATCH { title: "B היה כאן" }, DELETE (ברצף)
//   ואז A קורא GET ← stillExists, title | isSafe(report): שלוש פעמים 404, המשימה קיימת, הכותרת "של A"
//
// הרצה:   node 21-auth/starter/P21-E99.ts
// בדיקה:  npm run check P21-E99
