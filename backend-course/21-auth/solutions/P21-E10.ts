// P21-E10
import { CanActivate, Controller, ExecutionContext, Get, Injectable, Module, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import type { Request } from "express";

export const JWT_SECRET = "e10-secret-for-exercises-only-0123456789";

export interface AuthUser {
  id: number;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const match = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");
    if (!match) throw new UnauthorizedException("נדרשת התחברות");
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; role: string }>(match[1], { algorithms: ["HS256"] });
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException("טוקן לא תקין");
    }
  }
}

@Controller()
export class ProfileController {
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: AuthUser }) {
    return req.user;
  }

  @Get("hello")
  hello() {
    return { hello: "world" };
  }
}

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET })],
  controllers: [ProfileController],
  providers: [JwtAuthGuard],
})
export class ProfileModule {}
