// P21-E54: guard שמקבל Bearer או cookie
import { CanActivate, Controller, ExecutionContext, Get, Injectable, Module, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";

export const SECRET = "p21-e54-secret-at-least-32-chars!!";

function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i !== -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.get("authorization");
    let token: string | undefined;
    if (header !== undefined) {
      token = /^Bearer\s+(\S+)$/i.exec(header)?.[1];
    } else {
      token = readCookie(req.get("cookie"), "access_token");
    }
    if (!token) throw new UnauthorizedException("נדרשת התחברות");
    try {
      const payload = await this.jwt.verifyAsync(token);
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException("טוקן לא תקין");
    }
  }
}

@Controller()
export class MeController {
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return req.user;
  }

  @Get("hello")
  hello() {
    return { hello: "world" };
  }
}

@Module({
  imports: [JwtModule.register({ secret: SECRET })],
  controllers: [MeController],
  providers: [JwtAuthGuard],
})
export class AppModule {}
