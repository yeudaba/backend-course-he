// P26.3-E84: לחכות ל־Synced ו־Healthy
// כתוב וייצא async waitForSync(getStatus, { timeoutMs, intervalMs, sleep, now })
//   Synced + Healthy ← הסטטוס · Degraded ← Error("DEGRADED") · נגמר הזמן ← Error("TIMEOUT") · שגיאות רשת — ממשיכים
//
// בדיקה:  npm run check P26.3-E84
