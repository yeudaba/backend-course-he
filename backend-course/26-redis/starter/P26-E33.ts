// P26-E33: TypedEmitter — חזרה על generics, class פרטי, Map ו־Set, ו־closures
// כתוב וייצא class TypedEmitter<Events extends Record<string, unknown>>:
//   on(event, listener) → פונקציה שמבטלת · off(event, listener) · once(event, listener) → פונקציה שמבטלת
//   emit(event, payload) → כמה מאזינים נקראו (לפי סדר הרישום) · listenerCount(event)
//   TypeScript בודק ששם האירוע קיים ושה־payload מתאים לו · אותו מאזין פעמיים — פעם אחת · שדות פרטיים (#)
//
// הרצה:   node 26-redis/starter/P26-E33.ts
// בדיקה:  npm run check P26-E33
