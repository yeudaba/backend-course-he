// P13-E56: מסך עזרה מיושר
export function formatHelp(tool, commands) {
  const left = commands.map((c) => (c.args ? `${c.name} ${c.args}` : c.name));
  const width = Math.max(0, ...left.map((s) => s.length));
  const lines = [`שימוש: ${tool} <פקודה> [ארגומנטים]`, "", "פקודות:"];
  commands.forEach((c, i) => lines.push("  " + left[i].padEnd(width + 3) + c.desc));
  return lines.join("\n");
}

console.log(formatHelp("expenses", [
  { name: "add", args: "<title> <amount>", desc: "הוספת הוצאה" },
  { name: "list", args: "", desc: "כל ההוצאות" },
  { name: "report", args: "<month>", desc: "סיכום חודשי" },
]));
