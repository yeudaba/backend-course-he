// P21-E11
import {
  CanActivate, Controller, createParamDecorator, ExecutionContext, Get, Injectable, Module, SetMetadata, UnauthorizedException,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import type { Request } from "express";

export const JWT_SECRET = "e11-secret-for-exercises-only-0123456789";

export interface AuthUser {
  id: number;
  role: string;
}

export const IS_PUBLIC = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    // getAllAndOverride: קודם המתודה, אחר כך ה־class
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const match = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");
    if (!match) throw new UnauthorizedException("נדרשת התחברות");
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; role: string }>(match[1]);
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException("טוקן לא תקין");
    }
  }
}

@Controller("notes")
export class NotesController {
  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return { owner: user.id, notes: [`הפתק של משתמש ${user.id}`] };
  }

  @Public()
  @Get("public")
  publicNotes() {
    return { notes: ["פתק לכולם"] };
  }
}

@Public()
@Controller("info")
export class InfoController {
  @Get()
  info() {
    return { name: "notes-api", version: "1.0" };
  }
}

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET })],
  controllers: [NotesController, InfoController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class NotesModule {}
