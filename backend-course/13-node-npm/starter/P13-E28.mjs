// P13-E28: מיזוג קובצי הגדרות במקביל — חזרה על Promise.all ו־reduce
// כתוב וייצא async function loadConfigs(files):
//   קורא את כל קובצי ה־JSON במקביל (Promise.all) וממזג אותם לפי הסדר — הקובץ המאוחר גובר (reduce + spread)
//   JSON לא תקין → Error(`${שם הקובץ בלי התיקייה}: JSON לא תקין`)
//   קובץ חסר — השגיאה של readFile עוברת הלאה כמו שהיא. מערך ריק → {}
//
// הרצה:   node 13-node-npm/starter/P13-E28.mjs
// בדיקה:  npm run check P13-E28
