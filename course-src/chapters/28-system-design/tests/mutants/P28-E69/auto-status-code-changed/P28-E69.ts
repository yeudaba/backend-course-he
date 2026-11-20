// P28-E69: redirect עם cache ו־X-Cache
import express from "express";

export type Link = { url: string; expiresAt: number | null };
export type Store = { get(code: string): Promise<Link | null> };
export type Cache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

export function redirectApp(deps: { store: Store; cache: Cache; now: () => number }) {
  const { store, cache, now } = deps;

  async function lookup(code: string): Promise<{ link: Link | null; hit: boolean }> {
    const key = `link:${code}`;
    try {
      const cached = await cache.get(key);
      if (cached !== null) return { link: JSON.parse(cached), hit: true };
    } catch {
      // cache למטה ← כמו miss
    }
    const link = await store.get(code);
    if (link) {
      try {
        await cache.set(key, JSON.stringify(link), 3600);
      } catch {
        // לא נורא — בפעם הבאה ננסה שוב
      }
    }
    return { link, hit: false };
  }

  const app = express();
  app.get("/:code", async (req, res) => {
    const { link, hit } = await lookup(req.params.code);
    res.set("X-Cache", hit ? "HIT" : "MISS");
    if (!link) return res.status(404).json({ error: "not found" });
    if (link.expiresAt !== null && link.expiresAt <= now()) return res.status(400).json({ error: "expired" });
    res.redirect(302, link.url);
  });
  return app;
}
