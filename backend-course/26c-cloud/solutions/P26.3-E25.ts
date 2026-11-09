// P26.3-E25: GitOps — לעדכן את ה־tag של image ב־repo התצורה, בלי להרוס את הקובץ
import { parseAllDocuments, isMap, isSeq, YAMLMap } from "yaml";

const TAG_RE = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

// "ghcr.io/x/app:1.2" ← "ghcr.io/x/app"; גם @sha256:…; ולא מתבלבל עם port של registry (localhost:5000/app)
export function repositoryOf(image: string): string {
  const at = image.indexOf("@");
  const noDigest = at >= 0 ? image.slice(0, at) : image;
  const slash = noDigest.lastIndexOf("/");
  const colon = noDigest.lastIndexOf(":");
  return colon > slash ? noDigest.slice(0, colon) : noDigest;
}

function podSpecs(doc: any): YAMLMap[] {
  const out: YAMLMap[] = [];
  const kind = doc.get("kind");
  const spec = doc.get("spec");
  if (!isMap(spec)) return out;
  const tpl = kind === "CronJob" ? (spec.getIn(["jobTemplate", "spec", "template", "spec"]) as unknown) : spec.getIn(["template", "spec"]);
  if (isMap(tpl)) out.push(tpl);
  return out;
}

export function bumpImageTag(text: string, repository: string, tag: string): { text: string; changed: number } {
  if (!TAG_RE.test(tag)) throw new Error(`tag לא תקין: ${tag}`);
  const docs = parseAllDocuments(text);
  let changed = 0;
  for (const doc of docs) {
    if ("errors" in doc && doc.errors.length) throw new Error(`YAML לא תקין: ${doc.errors[0].message}`);
    for (const pod of podSpecs(doc)) {
      for (const field of ["initContainers", "containers"]) {
        const list = pod.get(field);
        if (!isSeq(list)) continue;
        for (const c of list.items) {
          if (!isMap(c)) continue;
          const image = c.get("image");
          if (typeof image !== "string" || repositoryOf(image) !== repository) continue;
          const next = `${repository}:${tag}`;
          if (image !== next) {
            c.set("image", next);
            changed++;
          }
        }
      }
    }
  }
  if (changed === 0 && !text.includes(`${repository}:${tag}`)) throw new Error(`לא נמצא image של ${repository}`);
  return { text: docs.map((d) => d.toString()).join(""), changed };
}
