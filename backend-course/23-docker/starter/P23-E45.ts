// P23-E45: runArgs
// כתוב וייצא type RunSpec ו־runArgs(spec): string[] — run, -d, --rm, --name, --restart, -e K=V, -p, -v, image, command
//   image בלי tag ← Error(`צריך tag מפורש: ${image}`) | rm + restart ← Error("--rm ו־--restart לא הולכים יחד")
//
// הרצה:   node 23-docker/starter/P23-E45.ts
// בדיקה:  npm run check P23-E45
