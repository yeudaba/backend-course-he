// P29-E51: קישורים בתשובה של המודל
export function safeLinks(markdown: string, allowedHosts: string[]) {
  const removed: string[] = [];
  const kept: string[] = [];
  const allowed = (raw: string) => {
    try {
      const u = new URL(raw);
      const host = u.hostname.toLowerCase();
      return u.protocol === "https:" || allowedHosts.some((h) => host === h || host.endsWith("." + h));
    } catch {
      return false;
    }
  };
  let text = markdown.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (all, label: string, url: string) => {
    if (allowed(url)) {
      kept.push(all);
      return `\u0000${kept.length - 1}\u0000`;
    }
    removed.push(url);
    return label;
  });
  text = text.replace(/https?:\/\/[^\s)]+/g, (url) => {
    if (allowed(url)) return url;
    removed.push(url);
    return "[קישור הוסר]";
  });
  text = text.replace(/\u0000(\d+)\u0000/g, (_, i: string) => kept[Number(i)]);
  return { text, removed };
}
