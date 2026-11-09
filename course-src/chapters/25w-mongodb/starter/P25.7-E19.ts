// P25.7-E19: router של פתקים עם ObjectId
import express from "express";
import { ObjectId, type Db } from "mongodb";

export function notesRouter(db: Db) {
  const router = express.Router();
  // כתוב כאן: POST / ו־GET /:id
  return router;
}
