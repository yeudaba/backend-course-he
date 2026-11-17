const WORDS = ["PASSWORD", "SECRET", "TOKEN", "API_KEY"];

function findSecrets(text) {
  const found = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("sk_live_")) {
      found.push({ line: i + 1, kind: "stripe" });
      continue;
    }
    if (line.includes("PRIVATE KEY-----")) {
      found.push({ line: i + 1, kind: "private-key" });
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const name = line.slice(0, eq).trim().split(" ").at(-1).toUpperCase();
    let value = line.slice(eq + 1).trim();
    if (value.endsWith(";")) {
      value = value.slice(0, -1);
    }
    value = value.replaceAll('"', "").replaceAll("'", "").trim();
    if (WORDS.some((w) => name.includes(w)) && value !== "" && !value.startsWith("process.env")) {
      found.push({ line: i + 1, kind: "assignment" });
    }
  }
  return found;
}

console.log(findSecrets('const stripe = "sk_live_51Hx9QzA";\nconst apiKey = process.env.API_KEY;'));

module.exports = { findSecrets };
