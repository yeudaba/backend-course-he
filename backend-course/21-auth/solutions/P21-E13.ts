// P21-E13
import {
  CanActivate, Controller, Delete, ExecutionContext, ForbiddenException, Get, HttpCode, Injectable, Module, Param,
  SetMetadata, UnauthorizedException,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";

export type Role = "user" | "manager" | "admin";

// מדמה התחברות בשביל התרגיל (במקום JWT): x-user-id ו־x-user-role ב־headers
@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const id = Number(req.get("x-user-id"));
    if (!Number.isInteger(id) || id < 1) throw new UnauthorizedException("נדרשת התחברות");
    req.user = { id, role: req.get("x-user-role") ?? "user" };
    return true;
  }
}

export const ROLES = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [context.getHandler(), context.getClass()]);
    if (!roles || roles.length === 0) return true;
    const user = context.switchToHttp().getRequest().user;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException("אין הרשאה");
    return true;
  }
}

@Controller("reports")
@Roles("manager", "admin")
export class ReportsController {
  @Get()
  list() {
    return [{ id: 1, title: "מכירות נובמבר" }];
  }

  @Delete(":id")
  @Roles("admin") // מחליף את מה שעל ה־class
  @HttpCode(204)
  remove(@Param("id") id: string) {}
}

@Controller("profile")
export class ProfileController {
  @Get()
  profile() {
    return { ok: true };
  }
}

@Module({
  controllers: [ReportsController, ProfileController],
  providers: [
    { provide: APP_GUARD, useClass: FakeAuthGuard }, // קודם "מי אתה"
    { provide: APP_GUARD, useClass: RolesGuard }, // אחר כך "מה מותר"
  ],
})
export class ReportsModule {}
