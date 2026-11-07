// P21-E21: שלוש תקלות ב־guard — "bearer" נדחה, /status דורש טוקן, וטוקן לא תקין מחזיר 403
import {
  CanActivate, Controller, ExecutionContext, Get, Injectable, Module, SetMetadata, UnauthorizedException,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import type { Request } from "express";

export const JWT_SECRET = "e21-secret-for-exercises-only-0123456789";
export const IS_PUBLIC = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.get<boolean>(IS_PUBLIC, context.getHandler())) return true;
    const req = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const match = /^Bearer (.+)$/.exec(req.get("authorization") ?? "");
    if (!match) throw new UnauthorizedException("נדרשת התחברות");
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number }>(match[1]);
      req.user = { id: payload.sub };
      return true;
    } catch {
      return false;
    }
  }
}

@Controller("tasks")
export class TasksController {
  @Get()
  list() {
    return [{ id: 1, title: "משימה סודית" }];
  }
}

@Public()
@Controller("status")
export class StatusController {
  @Get()
  status() {
    return { ok: true };
  }
}

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET })],
  controllers: [TasksController, StatusController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
