import { Injectable } from "@nestjs/common";
import type { RefreshToken as Row } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { RefreshTokenRecord, RefreshTokensRepository } from "./refresh-tokens.repository";

const toRecord = (row: Row): RefreshTokenRecord => ({
  id: row.id,
  userId: row.userId,
  tokenHash: row.tokenHash,
  expiresAt: row.expiresAt.toISOString(),
  revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
});

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insert(data: { userId: number; tokenHash: string; expiresAt: string }) {
    return toRecord(await this.prisma.refreshToken.create({ data: { ...data, expiresAt: new Date(data.expiresAt) } }));
  }

  async findByHash(tokenHash: string) {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    return row ? toRecord(row) : undefined;
  }

  async revoke(id: number, at: string) {
    // UPDATE ... WHERE id = ? AND revoked_at IS NULL — אטומי (פרק 18): רק בקשה אחת תצליח
    const { count } = await this.prisma.refreshToken.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date(at) } });
    return count === 1;
  }

  async revokeAllForUser(userId: number, at: string) {
    const { count } = await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(at) } });
    return count;
  }
}
