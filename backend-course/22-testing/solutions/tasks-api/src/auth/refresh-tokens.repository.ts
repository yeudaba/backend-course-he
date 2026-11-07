export interface RefreshTokenRecord {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
}

export const REFRESH_TOKENS_REPOSITORY = "REFRESH_TOKENS_REPOSITORY";

export interface RefreshTokensRepository {
  insert(data: { userId: number; tokenHash: string; expiresAt: string }): Promise<RefreshTokenRecord>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | undefined>;
  // true רק אם הטוקן היה פעיל ועכשיו בוטל — בפעולה אחת, כך ששתי בקשות מקבילות לא "יחליפו" אותו פעמיים
  revoke(id: number, at: string): Promise<boolean>;
  revokeAllForUser(userId: number, at: string): Promise<number>;
}

export class InMemoryRefreshTokensRepository implements RefreshTokensRepository {
  #tokens: RefreshTokenRecord[] = [];
  #nextId = 1;

  async insert(data: { userId: number; tokenHash: string; expiresAt: string }) {
    const record = { id: this.#nextId++, ...data, revokedAt: null };
    this.#tokens.push(record);
    return { ...record };
  }

  async findByHash(tokenHash: string) {
    const record = this.#tokens.find((t) => t.tokenHash === tokenHash);
    return record && { ...record };
  }

  async revoke(id: number, at: string) {
    const record = this.#tokens.find((t) => t.id === id && t.revokedAt === null);
    if (!record) return false;
    record.revokedAt = at;
    return true;
  }

  async revokeAllForUser(userId: number, at: string) {
    const active = this.#tokens.filter((t) => t.userId === userId && t.revokedAt === null);
    for (const t of active) t.revokedAt = at;
    return active.length;
  }
}
