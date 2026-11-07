// P15-E19
// GET /weather/:city → 200 { city, tempC, summary } | null → 404 CITY_NOT_FOUND
// זרק → 502 UPSTREAM_ERROR | יותר מ־1000ms → 504 UPSTREAM_TIMEOUT
import express from "express";

type Forecast = { tempC: number; summary: string };

export function createApp({ getForecast }: { getForecast: (city: string) => Promise<Forecast | null> }) {
  const app = express();
  // כתוב כאן
  return app;
}
