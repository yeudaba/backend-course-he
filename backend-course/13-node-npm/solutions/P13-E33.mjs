// P13-E33: שם חבילה חוקי
const part = (s) => /^[a-z0-9-][a-z0-9._-]*$/.test(s);

export function isValidPackageName(name) {
  if (typeof name !== "string" || name.length < 1 || name.length > 214) return false;
  if (name.startsWith("@")) {
    const parts = name.slice(1).split("/");
    return parts.length === 2 && part(parts[0]) && part(parts[1]);
  }
  return part(name);
}

for (const n of ["express", "@types/node", "My-Package", ".hidden", "_x", "a b", "@scope", "@a/b/c", "lodash.merge"]) {
  console.log(n.padEnd(14), isValidPackageName(n));
}
