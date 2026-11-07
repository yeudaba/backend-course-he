// P21-E10: JwtAuthGuard + GET /me
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
    return true; // כתוב כאן
  }
}

@Controller()
export class ProfileController {
  @Get("me")
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
