// P13-E27: העלאת גרסה (semver) עם switch
export function bump(version, kind) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`גרסה לא תקינה: ${version}`);
  }
  const [major, minor, patch] = version.split(".").map(Number);
  switch (kind) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`סוג לא מוכר: ${kind}`);
  }
}

console.log(bump("1.4.2", "patch"), bump("1.4.2", "minor"), bump("1.4.2", "major"));
console.log(bump("0.9.9", "minor"));
try {
  bump("1.4", "patch");
} catch (err) {
  console.log(err.message);
}
