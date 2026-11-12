// P22-E71: מריץ מוטנטים
// כתוב וייצא type Mutant = { desc, replace: [from, to][] }, type Result = { killed, survived, score }
//   runMutants(source, mutants, runTests): קודם על המקור (false ← Error("הבדיקות נכשלות על הקוד התקין"))
//   החלפות לפי הסדר, מופע ראשון; לא נמצא ← Error(`"${from}" לא נמצא (${desc})`) | true ← שרד | score: אחוז שלם (בלי מוטנטים ← 100)
//
// הרצה:   node 22-testing/starter/P22-E71.ts
// בדיקה:  npm run check P22-E71
