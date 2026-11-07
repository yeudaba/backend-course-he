// P21-E13: @Roles() ו־RolesGuard. /reports — manager או admin; DELETE — רק admin
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
// כתוב כאן: Roles, RolesGuard

@Controller("reports")
export class ReportsController {
  @Get()
  list() {
    return [{ id: 1, title: "מכירות נובמבר" }];
  }

  @Delete(":id")
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
    { provide: APP_GUARD, useClass: FakeAuthGuard },
  ],
})
export class ReportsModule {}
