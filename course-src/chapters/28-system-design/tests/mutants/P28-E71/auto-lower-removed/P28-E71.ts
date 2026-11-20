// P28-E71: רשימת חסימה לפי מתחם
const clean = (d: string) => d.trim().replace(/\.$/, "");

export function createBlocklist(domains: string[]) {
  const blocked = new Set(domains.map(clean));
  return (url: string): boolean => {
    let host: string;
    try {
      host = clean(new URL(url).hostname);
    } catch {
      return true;
    }
    const parts = host.split(".");
    for (let i = 0; i < parts.length; i++) {
      if (blocked.has(parts.slice(i).join("."))) return true;
    }
    return false;
  };
}
