// P08-E10
// attempt(() => 5) → { ok: true, value: 5 }
// attempt(() => { throw new Error("x"); }) → { ok: false, error: "x" }
function attempt(fn) {
  // כתוב כאן
}

// הערך של הפונקציה הראשונה שהצליחה; אם כולן נכשלו — throw new Error("כל הניסיונות נכשלו")
function firstSuccessful(fns) {
  // כתוב כאן
}

module.exports = { attempt, firstSuccessful };
