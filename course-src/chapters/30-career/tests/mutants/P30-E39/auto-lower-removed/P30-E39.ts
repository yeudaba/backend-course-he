// P30-E39: שם ל־repo
export function repoName(title: string): string {
  let s = title
    
    .replace(/[\s_.]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  s = s.slice(0, 40).replace(/-+$/, "");
  if (!s) throw new Error(`אי אפשר לבנות שם מ־"${title}"`);
  return s;
}
