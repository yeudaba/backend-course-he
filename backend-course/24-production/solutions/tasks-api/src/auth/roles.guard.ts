import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { HttpError } from "../errors";
import type { Role } from "../users/users.repository";
import { ROLES, type AuthUser } from "./auth.decorators";

// רץ אחרי JwtAuthGuard (נרשם אחריו). בלי @Roles — כל משתמש מחובר עובר
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [context.getHandler(), context.getClass()]);
    if (!roles || roles.length === 0) return true;
    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (!user || !roles.includes(user.role)) throw new HttpError(403, "FORBIDDEN", "אין הרשאה");
    return true;
  }
}
