// P15.5-E15: טעינת לוח בקרה במקביל — חזרה על Promise.allSettled
// כתוב וייצא async function loadDashboard(getJson):
//   getJson("/me"), getJson("/tasks"), getJson("/stats") — במקביל
//   /me נכשלה → זורקים את אותה שגיאה. tasks/stats נכשלה → הערך null, ו־errors מקבל "tasks: <הודעה>"
//   → { me, tasks, stats, errors }
//
// הרצה:   node 15w-web-bridge/starter/P15.5-E15.mjs
// בדיקה:  npm run check P15.5-E15
