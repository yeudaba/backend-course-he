// P30-E19
// לפני שמגישים מטלת בית: בדיקה של הדברים שמראיין רואה ב־30 השניות הראשונות
export function checkSubmission(files: Readonly<Record<string, string>>): string[] {
  const paths = Object.keys(files);
  const problems: string[] = [];
  const readme = paths.find((p) => /^readme\.md$/i.test(p));
  if (!readme) problems.push("אין README.md");
  else if (!/```(bash|sh|shell)?\n[\s\S]*?(npm|docker|node|pnpm|yarn)\b/.test(files[readme])) problems.push("ב־README אין הוראות הרצה (בלוק קוד עם הפקודות)");
  if (!paths.some((p) => /(\.spec|\.test)\.[jt]s$/.test(p) || /^tests?\//.test(p))) problems.push("אין בדיקות");
  if (paths.some((p) => /(^|\/)node_modules\//.test(p))) problems.push("node_modules בתוך ההגשה");
  if (paths.some((p) => /(^|\/)\.env$/.test(p))) problems.push(".env בתוך ההגשה — סודות");
  const usesEnv = paths.some((p) => /\.[jt]s$/.test(p) && /process\.env\.\w+/.test(files[p]));
  if (usesEnv && !paths.some((p) => /(^|\/)\.env\.example$/.test(p))) problems.push("הקוד קורא משתני סביבה, ואין .env.example");
  const pkg = files["package.json"];
  if (!pkg) problems.push("אין package.json");
  else {
    try {
      if (!JSON.parse(pkg).scripts?.test) problems.push('אין script בשם "test" ב־package.json');
    } catch {
      problems.push("package.json לא תקין");
    }
  }
  return problems;
}
