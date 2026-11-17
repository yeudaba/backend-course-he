function diffStat(diff) {
  const stat = { files: 0, added: 0, removed: 0 };
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      stat.files++;
    } else if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    } else if (line.startsWith("+")) {
      stat.added++;
    } else if (line.startsWith("-")) {
      stat.removed++;
    }
  }
  return stat;
}

const diff = "diff --git a/p.js b/p.js\n--- a/p.js\n+++ b/p.js\n@@ -1,2 +1,2 @@\n a\n-b\n+c";
console.log(diffStat(diff));

module.exports = { diffStat };
