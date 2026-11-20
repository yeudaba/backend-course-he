// P28-E98: API של פיד ב־Express
import express from "express";

type Post = { id: number; author: string; text: string; at: number };

export function feedApp(opts: { celebrityThreshold: number; now: () => number }) {
  const followers = new Map<string, Set<string>>();
  const following = new Map<string, Set<string>>();
  const feeds = new Map<string, number[]>();
  const posts = new Map<number, Post>();
  const byAuthor = new Map<string, number[]>();
  let nextId = 1;
  let feedWrites = 0;

  const setOf = (m: Map<string, Set<string>>, k: string) => {
    if (!m.has(k)) m.set(k, new Set());
    return m.get(k)!;
  };
  const isCelebrity = (u: string) => (followers.get(u)?.size ?? 0) >= opts.celebrityThreshold;

  const app = express();
  app.use(express.json());

  app.post("/follow", (req, res) => {
    const { follower, followee } = req.body ?? {};
    if (typeof follower !== "string" || typeof followee !== "string" || !follower || !followee || follower !== followee) {
      return res.status(400).json({ error: "follower ו־followee שונים" });
    }
    setOf(followers, followee).add(follower);
    setOf(following, follower).add(followee);
    res.status(204).end();
  });

  app.post("/posts", (req, res) => {
    const { author, text } = req.body ?? {};
    if (typeof author !== "string" || !author || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "author ו־text חובה" });
    }
    const post: Post = { id: nextId++, author, text, at: opts.now() };
    posts.set(post.id, post);
    if (!byAuthor.has(author)) byAuthor.set(author, []);
    byAuthor.get(author)!.push(post.id);
    if (!isCelebrity(author)) {
      for (const f of followers.get(author) ?? []) {
        if (!feeds.has(f)) feeds.set(f, []);
        feeds.get(f)!.push(post.id);
        feedWrites++;
      }
    }
    res.status(201).json(post);
  });

  app.get("/feed/:user", (req, res) => {
    const user = req.params.user;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const found = new Map<number, Post>();
    for (const id of feeds.get(user) ?? []) found.set(id, posts.get(id)!);
    for (const f of following.get(user) ?? []) {
      if (!isCelebrity(f)) continue;
      for (const id of byAuthor.get(f) ?? []) found.set(id, posts.get(id)!);
    }
    const items = [...found.values()].sort((a, b) => b.at - a.at || b.id - a.id).slice(0, limit);
    res.json({ items });
  });

  app.get("/stats", (req, res) => res.json({ feedWrites }));
  return app;
}
