// P15.5-E72: לפרק CORS_ORIGINS
function isOrigin(x) {
  try {
    const u = new URL(x);
    return /^https?:$/.test(u.protocol) && u.pathname === "/" && !u.search && !u.hash && !x.endsWith("?") && !x.endsWith("#");
  } catch {
    return false;
  }
}

export function parseCorsOrigins(value, fallback = ["http://localhost:5500"]) {
  if (value === undefined || value.trim() === "") return [...fallback];
  if (value.trim() === "*") throw new Error("CORS_ORIGINS=* אסור — כתוב רשימה מפורשת");
  const items = value.split(",").map((s) => s.trim()).filter(Boolean);
  const bad = items.filter((x) => !isOrigin(x));
  if (bad.length) throw new Error(`CORS_ORIGINS לא תקין: ${bad.join(", ")}`);
  return [...new Set(items.map((x) => new URL(x).origin))];
}

console.log(parseCorsOrigins(undefined));
console.log(parseCorsOrigins("https://app.example.com, https://admin.example.com/,,https://APP.example.com"));
for (const v of ["*", "app.example.com, https://ok.test, https://x.test/admin"]) {
  try {
    parseCorsOrigins(v);
  } catch (err) {
    console.log(err.message);
  }
}
