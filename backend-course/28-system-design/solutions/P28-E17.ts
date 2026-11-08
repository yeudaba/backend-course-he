// P28-E17
// שירות קיצור קישורים — הלוגיקה, מעל store שאפשר להחליף (Map בבדיקות, PostgreSQL + Redis בפרודקשן)
export interface Link {
  code: string;
  url: string;
  createdAt: number;
  expiresAt: number | null;
  clicks: number;
}

export interface Store {
  get(code: string): Promise<Link | undefined>;
  insert(link: Link): Promise<boolean>; // false אם הקוד תפוס
  incrementClicks(code: string): Promise<void>;
}

export function memoryStore(): Store & { links: Map<string, Link> } {
  const links = new Map<string, Link>();
  return {
    links,
    get: async (code) => links.get(code),
    insert: async (link) => (links.has(link.code) ? false : (links.set(link.code, { ...link }), true)),
    incrementClicks: async (code) => {
      const l = links.get(code);
      if (l) l.clicks++;
    },
  };
}

const RESERVED = new Set(["api", "admin", "health", "login"]);

export function createShortener(store: Store, { newCode, now = () => Date.now() }: { newCode: () => string; now?: () => number }) {
  return {
    async create({ url, alias, ttlSeconds }: { url: string; alias?: string; ttlSeconds?: number }): Promise<Link> {
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("כתובת לא תקינה");
      }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("רק http/https"); // לא javascript: ולא data:
      if (alias !== undefined && (!/^[a-zA-Z0-9-]{3,30}$/.test(alias) || RESERVED.has(alias.toLowerCase()))) throw new Error("alias לא תקין");
      const base = { url: parsed.toString(), createdAt: now(), expiresAt: ttlSeconds ? now() + ttlSeconds * 1000 : null, clicks: 0 };
      if (alias !== undefined) {
        if (!(await store.insert({ ...base, code: alias }))) throw new Error("alias תפוס");
        return { ...base, code: alias };
      }
      for (let i = 0; i < 5; i++) {
        const code = newCode();
        if (await store.insert({ ...base, code })) return { ...base, code };
      }
      throw new Error("לא נמצא קוד פנוי");
    },
    // מה ה־redirect מחזיר: 302 (לא 301 — דפדפן שומר 301 לתמיד, ואז לא סופרים קליקים ואי אפשר לשנות יעד)
    async resolve(code: string): Promise<{ status: 302; location: string } | { status: 404 } | { status: 410 }> {
      const link = await store.get(code);
      if (!link) return { status: 404 };
      if (link.expiresAt !== null && now() >= link.expiresAt) return { status: 410 };
      await store.incrementClicks(code);
      return { status: 302, location: link.url };
    },
  };
}
