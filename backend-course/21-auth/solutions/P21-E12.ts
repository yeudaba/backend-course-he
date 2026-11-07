// P21-E12
import { Inject, Injectable, Module, UnauthorizedException } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";

export const CLOCK = "CLOCK";
export const ACCESS_TTL_SECONDS = 900;
export interface Clock {
  now(): Date;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  private nowSeconds() {
    return Math.floor(this.clock.now().getTime() / 1000);
  }

  issue(userId: number): Promise<string> {
    // iat מהשעון שלנו — ו־exp מחושב ממנו
    return this.jwt.signAsync({ sub: userId, iat: this.nowSeconds() }, { expiresIn: ACCESS_TTL_SECONDS });
  }

  async verify(token: string): Promise<{ userId: number }> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number }>(token, { clockTimestamp: this.nowSeconds() });
      return { userId: payload.sub };
    } catch (err) {
      const expired = err instanceof Error && err.name === "TokenExpiredError";
      throw new UnauthorizedException(expired ? "פג תוקף הטוקן" : "טוקן לא תקין");
    }
  }
}

@Module({
  imports: [JwtModule.register({ secret: "e12-secret-for-exercises-only-0123456789" })],
  providers: [TokenService, { provide: CLOCK, useValue: { now: () => new Date() } }],
  exports: [TokenService],
})
export class TokensModule {}
