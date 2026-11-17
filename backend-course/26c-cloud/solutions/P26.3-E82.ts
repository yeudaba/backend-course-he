// P26.3-E82: tag ל־image מ־git
export function imageTag(ref: string, sha: string): string {
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error("sha לא תקין");
  const tag = /^refs\/tags\/(.+)$/.exec(ref);
  if (tag) {
    const m = /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)$/.exec(tag[1]);
    if (!m) throw new Error(`tag לא בפורמט vX.Y.Z: ${tag[1]}`);
    return m[1];
  }
  const branch = /^refs\/heads\/(.+)$/.exec(ref);
  if (!branch) throw new Error(`ref לא נתמך: ${ref}`);
  const clean = branch[1]
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/, "");
  return `${clean}-${sha.slice(0, 7)}`;
}
