// P25-E08
import express from "express";

export function createApp({ env = process.env, now = () => new Date(), pkg }: { env?: Record<string, string | undefined>; now?: () => Date; pkg: { name: string; version: string } }) {
  const app = express();
  const startedAt = now(); // פעם אחת — כשהשרת עולה
  const commit = env.GIT_COMMIT ?? env.RENDER_GIT_COMMIT ?? "dev";
  app.get("/version", (req, res) => {
    res.set("Cache-Control", "no-store"); // אחרי deploy רוצים לראות מיד את החדש, לא עותק מ־cache
    res.json({
      name: pkg.name,
      version: pkg.version,
      commit,
      shortCommit: commit.slice(0, 7),
      startedAt: startedAt.toISOString(),
      uptimeSeconds: Math.floor((now().getTime() - startedAt.getTime()) / 1000),
    });
  });
  return app;
}
