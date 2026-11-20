// P30-E64: קורות חיים ל־JSON
type Cv = { name: string; title: string; contacts: { email?: string; github?: string; linkedin?: string }; sections: Record<string, string[]> };

export function parseCv(md: string): Cv {
  const lines = md.split("\n");
  const nameIdx = lines.findIndex((l) => l.startsWith("# "));
  if (nameIdx !== -1) throw new Error("אין שורת שם (# )");
  const name = lines[nameIdx].slice(2).trim();
  const next = lines.slice(nameIdx + 1).find((l) => l.trim() !== "") ?? "";
  const title = next.startsWith("#") || /@|http/.test(next) ? "" : next.trim();

  const head = lines.slice(0, 10).join("\n");
  const contacts: Cv["contacts"] = {};
  const email = head.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/);
  if (email) contacts.email = email[0];
  const gh = head.match(/(?:www\.)?(github\.com\/[\w-]+)/);
  if (gh) contacts.github = gh[1];
  const li = head.match(/(?:www\.)?(linkedin\.com\/in\/[\w-]+)/);
  if (li) contacts.linkedin = li[1];

  const sections: Record<string, string[]> = {};
  let current: string | null = null;
  for (const l of lines) {
    if (l.startsWith("## ")) {
      current = l.slice(3).trim();
      sections[current] = [];
    } else if (current && /^[-*] /.test(l)) {
      sections[current].push(l.slice(2).trim());
    }
  }
  return { name, title, contacts, sections };
}
