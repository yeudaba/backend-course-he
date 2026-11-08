import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { HttpError } from "../errors";
import { PrismaService } from "../prisma/prisma.service";
import { type AuthUser, IS_PUBLIC, type Role, ROLES } from "./auth.decorators";

// guard גלובלי: אימות (401) ואז הרשאה לפי @Roles (403)
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true;
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "")?.[1];
    if (!token) throw new HttpError(401, "UNAUTHORIZED", "נדרשת התחברות");
    let sub: number;
    try {
      sub = (await this.jwt.verifyAsync<{ sub: number }>(token)).sub;
    } catch {
      throw new HttpError(401, "UNAUTHORIZED", "טוקן לא תקין או שפג תוקפו");
    }
    // התפקיד מהמסד, לא מהטוקן: מנהל שהורד מתפקידו — מאבד הרשאות מיד
    const user = await this.prisma.user.findUnique({ where: { id: sub }, select: { id: true, email: true, role: true } });
    if (!user) throw new HttpError(401, "UNAUTHORIZED", "המשתמש לא קיים");
    req.user = user;
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, targets);
    if (roles && !roles.includes(user.role)) throw new HttpError(403, "FORBIDDEN", "אין הרשאה");
    return true;
  }
}
