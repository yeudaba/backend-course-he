// P28.5-E55: /health עונה גם באמצע דוח
import express from "express";

export function score(v: number): number {
  let x = v;
  for (let i = 0; i < 200; i++) x = (x * 1103515245 + 12345) % 2147483647;
  return x % 1000;
}

const pause = () => new Promise<void>((resolve) => setImmediate(resolve));

export function reportApp(values: number[]) {
  const app = express();
  app.get("/health", (req, res) => res.json({ ok: true }));
  app.get("/report", async (req, res) => {
    let sum = 0;
    let max = -Infinity;
    for (let i = 0; i < values.length; i++) {
      const s = score(values[i]);
      sum += s;
      if (s > max) max = s;
      if (i === 0) await pause();
    }
    res.json({ count: values.length, sum, max: values.length ? max : null });
  });
  return app;
}
