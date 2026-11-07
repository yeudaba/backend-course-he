// P15-E19
import express from "express";

type Forecast = { tempC: number; summary: string };

class TimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function createApp({ getForecast }: { getForecast: (city: string) => Promise<Forecast | null> }) {
  const app = express();
  app.get("/weather/:city", async (req, res) => {
    const city = req.params.city;
    let forecast: Forecast | null;
    try {
      forecast = await withTimeout(getForecast(city), 1000);
    } catch (err) {
      if (err instanceof TimeoutError) {
        res.status(504).json({ error: { code: "UPSTREAM_TIMEOUT", message: "שירות מזג האוויר לא ענה בזמן" } });
        return;
      }
      console.error(err);
      res.status(502).json({ error: { code: "UPSTREAM_ERROR", message: "שירות מזג האוויר לא זמין" } });
      return;
    }
    if (!forecast) {
      res.status(404).json({ error: { code: "CITY_NOT_FOUND", message: "עיר לא מוכרת" } });
      return;
    }
    res.json({ city, ...forecast });
  });
  return app;
}
