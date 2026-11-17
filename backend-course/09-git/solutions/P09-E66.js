function branchName(title) {
  let text = title.trim().toLowerCase();
  let prefix = "feature/";
  if (text.startsWith("fix:")) {
    prefix = "fix/";
    text = text.slice(4);
  }
  let clean = "";
  for (const ch of text) {
    const ok = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
    clean += ok ? ch : " ";
  }
  let slug = clean.split(" ").filter((w) => w !== "").join("-").slice(0, 30);
  while (slug.endsWith("-")) {
    slug = slug.slice(0, -1);
  }
  return prefix + slug;
}

console.log(branchName("Add monthly summary command"), branchName("FIX: crash when file is empty!"));

module.exports = { branchName };
