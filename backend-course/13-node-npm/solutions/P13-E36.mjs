// P13-E36: מה ישן?
const parts = (v) => v.replace(/^[~^]/, "").split(".").map(Number);
const TYPES = ["major", "minor", "patch"];

export function outdated(deps, latest) {
  const result = [];
  for (const [name, range] of Object.entries(deps)) {
    if (!(name in latest)) continue;
    const c = parts(range);
    const l = parts(latest[name]);
    for (let i = 0; i < 3; i++) {
      if (l[i] === c[i]) continue;
      if (l[i] > c[i]) {
        result.push({ name, current: c.join("."), latest: latest[name], type: TYPES[i] });
      }
      break;
    }
  }
  return result.sort((a, b) => (a.name < b.name ? -1 : 1));
}

console.log(outdated({ zod: "~4.1.5", express: "^4.18.2", pg: "8.16.0" }, { express: "5.1.0", zod: "4.1.12", pg: "8.16.0" }));
