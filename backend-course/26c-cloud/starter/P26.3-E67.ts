// P26.3-E67: כיבוי מסודר שמתאים ל־Kubernetes
// כתוב וייצא createGracefulShutdown({ server, drainMs, closeResources }) → { isReady(), shutdown() }
//   shutdown: isReady ← false מיד · מחכים drainMs (ממשיכים לענות) · server.close ומחכים · closeResources
//   קריאה שנייה ← אותו Promise
//
// בדיקה:  npm run check P26.3-E67
