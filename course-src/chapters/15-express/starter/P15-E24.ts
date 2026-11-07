// P15-E24 — אתגר: API לספרייה (הפירוט המלא בדף התרגילים)
// POST/GET /books, GET /books/:id, POST /books/:id/loans, POST /loans/:id/return, GET /loans/overdue
import express, { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

export function createApp({ now = () => new Date() }: { now?: () => Date } = {}) {
  const app = express();
  // כתוב כאן
  return app;
}
