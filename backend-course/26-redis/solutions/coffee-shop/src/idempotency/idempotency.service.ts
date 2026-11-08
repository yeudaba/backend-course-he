import { createHash } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { CLOCK, CONFIG, type AppConfig, type Clock } from "../config";
import { HttpError } from "../errors";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const VALID_KEY = /^[A-Za-z0-9_-]{8,100}$/;

// "בצע פעם אחת לכל (משתמש, מפתח)" — פרק 24. ה־UNIQUE במסד מבטיח שרק בקשה אחת זוכה, גם במקביל
@Injectable()
export class IdempotencyService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async run<T>(userId: number, key: string | undefined, scope: string, payload: unknown, action: () => Promise<{ status: number; body: T }>): Promise<{ status: number; body: T; replayed: boolean }> {
    if (key === undefined) throw new HttpError(400, "IDEMPOTENCY_KEY_REQUIRED", "חסר header של Idempotency-Key");
    if (!VALID_KEY.test(key)) throw new HttpError(400, "VALIDATION_ERROR", "Idempotency-Key: 8–100 תווים, אותיות, ספרות, - ו־_");
    const fingerprint = createHash("sha256").update(JSON.stringify([scope, payload])).digest("hex");
    const now = this.clock.now();

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.prisma.idempotencyKey.create({ data: { userId, key, fingerprint, createdAt: now } });
        break; // זכינו
      } catch (err) {
        if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
      }
      const row = await this.prisma.idempotencyKey.findUnique({ where: { userId_key: { userId, key } } });
      if (!row) continue;
      if (row.createdAt.getTime() <= now.getTime() - this.config.idempotencyTtlHours * 3_600_000) {
        await this.prisma.idempotencyKey.deleteMany({ where: { id: row.id } });
        continue;
      }
      if (row.fingerprint !== fingerprint) throw new HttpError(422, "IDEMPOTENCY_KEY_REUSED", "המפתח כבר שימש לבקשה אחרת");
      if (row.status === null) throw new HttpError(409, "IDEMPOTENCY_IN_PROGRESS", "בקשה עם המפתח הזה עדיין בטיפול");
      return { status: row.status, body: row.body as T, replayed: true };
    }

    try {
      const result = await action();
      await this.prisma.idempotencyKey.updateMany({ where: { userId, key }, data: { status: result.status, body: result.body as Prisma.InputJsonValue } });
      return { ...result, replayed: false };
    } catch (err) {
      // תשובה סופית של 4xx (למשל OUT_OF_STOCK) — נשמרת: אותה בקשה תקבל אותה תשובה. 5xx — משחררים, אפשר לנסות שוב
      if (err instanceof HttpError && err.status < 500) {
        const body = { error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } };
        await this.prisma.idempotencyKey.updateMany({ where: { userId, key }, data: { status: err.status, body: body as Prisma.InputJsonValue } });
      } else {
        await this.prisma.idempotencyKey.deleteMany({ where: { userId, key, status: null } });
      }
      throw err;
    }
  }
}
