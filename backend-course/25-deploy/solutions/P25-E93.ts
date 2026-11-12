// P25-E93: הכתובת של ה־API בדף
export function apiBase(html: string, pageUrl: string): string {
  const page = new URL(pageUrl);
  if (page.hostname === "localhost" || page.hostname === "127.0.0.1") return "http://localhost:3000";
  let api: string | undefined;
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/\bname="api-url"/i.test(tag)) api = /\bcontent="([^"]*)"/i.exec(tag)?.[1];
  }
  if (!api) throw new Error("חסר api-url");
  if (api.includes("YOUR-SERVICE")) throw new Error("api-url לא הוגדר");
  if (page.protocol === "https:" && api.startsWith("http:")) throw new Error("mixed content");
  return api.replace(/\/+$/, "");
}
