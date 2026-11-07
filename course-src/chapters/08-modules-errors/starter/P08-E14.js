// P08-E14: שגיאה → { status, body: { error } }
//   err.status מספרי בין 400 ל־499 → אותו status, err.message
//   SyntaxError                      → 400, "בקשה לא תקינה"
//   כל השאר                          → 500, "שגיאה פנימית"
function toHttpResponse(err) {
  // כתוב כאן
}

module.exports = { toHttpResponse };
