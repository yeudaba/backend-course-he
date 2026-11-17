// P26.3-E101: מה לבנות לפי הקבצים שהשתנו
type Target = "api" | "web" | "chart" | "ci";

export function changedTargets(files: string[]): Target[] {
  const out = new Set<Target>();
  for (const f of files) {
    if (f.endsWith(".md") || f.startsWith("docs/")) continue;
    if (f.startsWith("web/")) out.add("web");
    else if (f.startsWith("charts/")) out.add("chart");
    else if (f === "Jenkinsfile" || f.startsWith(".github/")) out.add("ci");
    else out.add("api");
  }
  return [...out].sort();
}
