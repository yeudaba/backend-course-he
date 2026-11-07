// P21-E12: TokenService — תוקף לפי CLOCK
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

  issue(userId: number): Promise<string> {
    return this.jwt.signAsync({ sub: userId }, { expiresIn: ACCESS_TTL_SECONDS }); // תקן: iat מה־CLOCK
  }

  async verify(token: string): Promise<{ userId: number }> {
    const payload = await this.jwt.verifyAsync<{ sub: number }>(token); // תקן: clockTimestamp, ושגיאות 401
    return { userId: payload.sub };
  }
}

@Module({
  imports: [JwtModule.register({ secret: "e12-secret-for-exercises-only-0123456789" })],
  providers: [TokenService, { provide: CLOCK, useValue: { now: () => new Date() } }],
  exports: [TokenService],
})
export class TokensModule {}
