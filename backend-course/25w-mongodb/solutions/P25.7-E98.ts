// P25.7-E98: POST /login — עם bcrypt ובלי injection
import bcrypt from "bcryptjs";
import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";

const schema = z.strictObject({ email: z.string().trim().toLowerCase(), password: z.string() });

export function loginRouter(db: Db) {
  const users = db.collection<{ _id: string; email: string; passwordHash: string }>("users");
  const router = Router();
  router.post("/login", async (req, res) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR" } });
      return;
    }
    const user = await users.findOne({ email: r.data.email });
    const ok = user !== null && (await bcrypt.compare(r.data.password, user.passwordHash));
    if (!ok) {
      res.status(401).json({ error: { code: "INVALID_CREDENTIALS" } });
      return;
    }
    res.json({ id: user._id, email: user.email });
  });
  return router;
}
