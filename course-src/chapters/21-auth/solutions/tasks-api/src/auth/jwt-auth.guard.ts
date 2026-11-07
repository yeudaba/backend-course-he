import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { HttpError } from "../errors";
import { IS_PUBLIC, type AuthUser } from "./auth.decorators";
import { AuthService } from "./auth.service";

// נרשם גלובלית (APP_GUARD): כל route מוגן, אלא אם סומן @Public()
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const match = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");
    if (!match) throw new HttpError(401, "UNAUTHORIZED", "נדרשת התחברות");
    req.user = await this.auth.verifyAccessToken(match[1]);
    return true;
  }
}
