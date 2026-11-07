// P21-E25: אתגר — מפתחות API למכונות (המפרט המלא בדף התרגילים)
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

@Injectable()
export class ApiKeysService {
  constructor(@Inject(CLOCK) private readonly clock: Clock) {}
  // כתוב כאן: create, list, revoke, authenticate
}

// כתוב כאן: RequireScope, ApiKeyGuard, KeysController, DataController

@Module({
  controllers: [],
  providers: [ApiKeysService, FakeAuthGuard, { provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class ApiKeysModule {}
