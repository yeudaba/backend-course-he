// P22-E101 — הקוד שבודקים (לא משנים אותו)
import express, { type NextFunction, type Request, type Response } from "express";
import { z, ZodError } from "zod";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ code: err.code, message: err.message });
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "קלט לא תקין",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof SyntaxError && (err as { type?: string }).type === "entity.parse.failed") {
    return res.status(400).json({ code: "INVALID_JSON", message: "JSON לא תקין" });
  }
  res.status(500).json({ code: "INTERNAL", message: "שגיאה פנימית" });
}

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/http-error", () => {
    throw new HttpError(409, "EMAIL_TAKEN", "האימייל כבר רשום");
  });
  app.post("/validate", (req, res) => {
    const body = z.object({ name: z.string() }).parse(req.body);
    res.json(body);
  });
  app.get("/boom", () => {
    throw new Error("db password is hunter2 at 10.0.0.5");
  });
  app.use(errorHandler);
  return app;
}
