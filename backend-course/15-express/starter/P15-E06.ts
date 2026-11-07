// P15-E06
// GET /hello?name=דנה → { message: "שלום דנה" } (בלי name → "שלום אורח")
// GET /add/2/3 → { sum: 5 } | לא מספרים → 400 { error: "a ו־b חייבים להיות מספרים" }
import express from "express";

export function createApp() {
  const app = express();
  // כתוב כאן
  return app;
}
