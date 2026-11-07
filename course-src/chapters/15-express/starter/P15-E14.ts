// P15-E14
// GET /products?q=&minPrice=&maxPrice=&sort= → מערך | לא תקין (וגם min > max) → 400 VALIDATION_ERROR
import express from "express";
import { z } from "zod";

interface Product {
  id: number;
  name: string;
  price: number;
}

export function createApp(products: Product[]) {
  const app = express();
  // כתוב כאן
  return app;
}
