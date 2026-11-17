// P27-E96: request id לכל בקשה
import { randomUUID } from "node:crypto";
import type express from "express";

export function requestId(): express.RequestHandler {
  return (req, res, next) => {
    const incoming = req.get("X-Request-Id");
    const id = incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    res.locals.requestId = id;
    res.set("X-Request-Id", id);
    next();
  };
}
