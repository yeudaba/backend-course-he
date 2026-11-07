// P20-E14
import {
  CanActivate, Controller, ExecutionContext, ForbiddenException, Get, Inject, Injectable, Module,
  UnauthorizedException, UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

export const API_KEYS = "API_KEYS";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@Inject(API_KEYS) private readonly keys: Set<string>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.get("x-api-key");
    if (!key) throw new UnauthorizedException("חסר X-Api-Key");
    if (!this.keys.has(key)) throw new ForbiddenException("מפתח לא מוכר");
    return true;
  }
}

@Controller()
export class SecretController {
  @Get("public")
  public() {
    return { ok: true };
  }

  @Get("secret")
  @UseGuards(ApiKeyGuard)
  secret() {
    return { secret: 42 };
  }
}

@Module({
  controllers: [SecretController],
  providers: [ApiKeyGuard, { provide: API_KEYS, useValue: new Set(["dev-key"]) }],
})
export class SecretModule {}
