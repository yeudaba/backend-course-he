import { Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { IdempotencyRepository, Reservation } from "./idempotency.repository";

const isUniqueViolation = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

@Injectable()
export class PrismaIdempotencyRepository implements IdempotencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(userId: number, key: string, fingerprint: string, now: Date, ttlHours: number): Promise<Reservation> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // ה־UNIQUE (user_id, key) במסד הוא מה שמבטיח שרק בקשה אחת "זוכה" — גם כששתיים מגיעות באותו רגע
        await this.prisma.idempotencyKey.create({ data: { userId, key, fingerprint, createdAt: now } });
        return { kind: "new" };
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
      }
      const row = await this.prisma.idempotencyKey.findUnique({ where: { userId_key: { userId, key } } });
      if (!row) continue; // נמחק בינתיים — ננסה שוב
      if (row.createdAt.getTime() <= now.getTime() - ttlHours * 3_600_000) {
        await this.prisma.idempotencyKey.deleteMany({ where: { id: row.id } }); // פג תוקף — מתחילים מחדש
        continue;
      }
      if (row.fingerprint !== fingerprint) return { kind: "mismatch" };
      if (row.status === null) return { kind: "in_progress" };
      return { kind: "replay", status: row.status, body: row.body };
    }
    return { kind: "in_progress" };
  }

  async complete(userId: number, key: string, status: number, body: unknown) {
    await this.prisma.idempotencyKey.updateMany({ where: { userId, key }, data: { status, body: body as Prisma.InputJsonValue } });
  }

  async release(userId: number, key: string) {
    await this.prisma.idempotencyKey.deleteMany({ where: { userId, key, status: null } });
  }
}
