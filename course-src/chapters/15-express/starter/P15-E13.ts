// P15-E13
import express from "express";
import { z } from "zod";

// paginate([1..57], 3, 20) → { data: [41..57], meta: { page: 3, limit: 20, total: 57, totalPages: 3 } }
export function paginate<T>(items: T[], page: number, limit: number) {
  // כתוב כאן
}

// GET /products?page&limit → paginate(...) | לא תקין → 400 VALIDATION_ERROR
export function createApp(products: unknown[]) {
  const app = express();
  // כתוב כאן
  return app;
}
