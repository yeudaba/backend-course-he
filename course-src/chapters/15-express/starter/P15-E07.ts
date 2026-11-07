// P15-E07
// GET /products (?maxPrice=100) | GET /products/:id → 404 { error: { code: "NOT_FOUND", message: "המוצר לא נמצא" } }
import express from "express";

export interface Product {
  id: number;
  name: string;
  price: number;
}

export function createApp(products: Product[]) {
  const app = express();
  // כתוב כאן
  return app;
}
