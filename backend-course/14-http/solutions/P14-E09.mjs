// P14-E09
export function buildQuery(params) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    for (const v of Array.isArray(value) ? value : [value]) sp.append(key, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

console.log(buildQuery({ page: 2, tag: ["a", "b"], q: "red & blue", skip: undefined }));
console.log(JSON.stringify(buildQuery({ skip: null })));
