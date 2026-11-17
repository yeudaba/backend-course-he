// P21-E63: tokenVersion — ביטול מיידי של כל ה־access tokens של משתמש
import { JwtService } from "@nestjs/jwt";

export class AccessTokens {
  private readonly jwt: JwtService;
  private readonly now: () => number;
  private readonly versions = new Map<number, number>();

  constructor(secret: string, now: () => number) {
    this.jwt = new JwtService({ secret });
    this.now = now;
  }

  issue(userId: number): Promise<string> {
    const ver = this.versions.get(userId) ?? 0;
    return this.jwt.signAsync({ sub: userId, ver, iat: this.now() }, { expiresIn: 900 });
  }

  async verify(token: string): Promise<{ id: number }> {
    let payload: { sub: number; ver: number };
    try {
      payload = await this.jwt.verifyAsync(token, { clockTimestamp: this.now() });
    } catch {
      throw new Error("טוקן לא תקין");
    }
    if (payload.ver !== (this.versions.get(payload.sub) ?? 0)) throw new Error("טוקן לא תקין");
    return { id: payload.sub };
  }

  logoutEverywhere(userId: number): void {
    this.versions.set(userId, (this.versions.get(userId) ?? 0) + 1);
  }
}
