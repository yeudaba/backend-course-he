// P24-E44: error handler עם requestId
// כתוב וייצא errorHandler(log) — error middleware של Express (4 פרמטרים):
//   4xx עם err.status ← אותו status, { error: { code: "BAD_REQUEST", message, requestId } }, log("warn", "client error", ...)
//   כל השאר ← 500 { error: { code: "INTERNAL", ... } }, log("error", "unhandled error", { requestId, err: { name, message, stack } })
//   res.headersSent ← next(err)
//
// בדיקה:  npm run check P24-E44
