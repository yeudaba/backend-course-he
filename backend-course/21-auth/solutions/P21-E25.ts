// P21-E25
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  Body, CanActivate, Controller, Delete, ExecutionContext, ForbiddenException, Get, HttpCode, Inject, Injectable, Module,
  NotFoundException, Param, ParseIntPipe, Post, Req, SetMetadata, UnauthorizedException, UseGuards,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}
export type Scope = "read" | "write";

// מדמה התחברות של משתמש (במקום JWT): x-user-id ב־header — לניהול המפתחות
@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const id = Number(req.get("x-user-id"));
    if (!Number.isInteger(id) || id < 1) throw new UnauthorizedException("נדרשת התחברות");
    req.user = { id };
    return true;
  }
}

interface ApiKeyRecord {
  id: number;
  userId: number;
  name: string;
  prefix: string;
  hash: string;
  scopes: Scope[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

const sha256 = (v: string) => createHash("sha256").update(v).digest();
const KEY_FORMAT = /^tk_([0-9a-f]{8})_[A-Za-z0-9_-]{32}$/;

@Injectable()
export class ApiKeysService {
  private readonly keys: ApiKeyRecord[] = [];

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  // המפתח המלא מוחזר פעם אחת בלבד. נשמרים: prefix (לחיפוש ולתצוגה) ו־hash
  create(userId: number, name: string, scopes: Scope[]) {
    const prefix = randomBytes(4).toString("hex");
    const key = `tk_${prefix}_${randomBytes(24).toString("base64url")}`;
    const record: ApiKeyRecord = {
      id: this.keys.length + 1, userId, name, prefix, hash: sha256(key).toString("hex"), scopes,
      createdAt: this.clock.now().toISOString(), lastUsedAt: null, revokedAt: null,
    };
    this.keys.push(record);
    return { id: record.id, name, prefix, scopes, key };
  }

  list(userId: number) {
    return this.keys
      .filter((k) => k.userId === userId)
      .map(({ id, name, prefix, scopes, createdAt, lastUsedAt, revokedAt }) => ({ id, name, prefix, scopes, createdAt, lastUsedAt, revoked: revokedAt !== null }));
  }

  revoke(userId: number, id: number) {
    const record = this.keys.find((k) => k.id === id && k.userId === userId);
    if (!record) throw new NotFoundException(`מפתח ${id} לא נמצא`);
    record.revokedAt ??= this.clock.now().toISOString();
  }

  authenticate(key: string): { userId: number; scopes: Scope[] } | undefined {
    const prefix = KEY_FORMAT.exec(key)?.[1];
    if (!prefix) return undefined;
    const record = this.keys.find((k) => k.prefix === prefix && k.revokedAt === null);
    if (!record || !timingSafeEqual(sha256(key), Buffer.from(record.hash, "hex"))) return undefined;
    record.lastUsedAt = this.clock.now().toISOString();
    return { userId: record.userId, scopes: record.scopes };
  }
}

const SCOPE = "scope";
export const RequireScope = (scope: Scope) => SetMetadata(SCOPE, scope);

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly keys: ApiKeysService, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.get("x-api-key");
    if (!key) throw new UnauthorizedException("חסר X-Api-Key");
    const auth = this.keys.authenticate(key);
    if (!auth) throw new UnauthorizedException("מפתח לא תקין");
    const scope = this.reflector.get<Scope | undefined>(SCOPE, context.getHandler());
    if (scope && !auth.scopes.includes(scope)) throw new ForbiddenException(`למפתח אין הרשאת ${scope}`);
    req.apiKey = auth;
    return true;
  }
}

@Controller("keys")
@UseGuards(FakeAuthGuard)
export class KeysController {
  constructor(private readonly keys: ApiKeysService) {}

  @Post()
  create(@Req() req: { user: { id: number } }, @Body() body: { name: string; scopes: Scope[] }) {
    const scopes = (Array.isArray(body.scopes) ? body.scopes : []).filter((s): s is Scope => s === "read" || s === "write");
    return this.keys.create(req.user.id, String(body.name), scopes.length ? scopes : ["read"]);
  }

  @Get()
  list(@Req() req: { user: { id: number } }) {
    return this.keys.list(req.user.id);
  }

  @Delete(":id")
  @HttpCode(204)
  revoke(@Req() req: { user: { id: number } }, @Param("id", ParseIntPipe) id: number) {
    this.keys.revoke(req.user.id, id);
  }
}

@Controller("data")
@UseGuards(ApiKeyGuard)
export class DataController {
  @Get()
  @RequireScope("read")
  read(@Req() req: { apiKey: { userId: number } }) {
    return { data: [1, 2, 3], owner: req.apiKey.userId };
  }

  @Post()
  @RequireScope("write")
  write(@Req() req: { apiKey: { userId: number } }) {
    return { saved: true, owner: req.apiKey.userId };
  }
}

@Module({
  controllers: [KeysController, DataController],
  providers: [ApiKeysService, FakeAuthGuard, ApiKeyGuard, { provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class ApiKeysModule {}
