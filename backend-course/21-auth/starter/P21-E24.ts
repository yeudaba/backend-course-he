// P21-E24: אתגר — API של סימניות עם משתמשים (המפרט המלא בדף התרגילים)
// הכול בקובץ אחד: tokens, decorators, DTOs, UsersService, AuthService, guards, controllers, modules.
import { createHash, randomBytes } from "node:crypto";
import {
  Body, CanActivate, ConflictException, Controller, createParamDecorator, Delete, ExecutionContext, ForbiddenException, Get,
  HttpCode, Inject, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, SetMetadata, UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { APP_GUARD, APP_PIPE, Reflector } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { IsEmail, IsString, IsUrl, Length, MinLength } from "class-validator";
import type { Request } from "express";

export const CLOCK = "CLOCK";
export const CONFIG = "CONFIG";
export interface Clock {
  now(): Date;
}
export interface Config {
  jwtSecret: string;
  accessTtlSeconds: number;
  refreshTtlDays: number;
  bcryptRounds: number;
}

@Module({
  providers: [
    { provide: CLOCK, useValue: { now: () => new Date() } },
    { provide: CONFIG, useValue: { jwtSecret: "change-me-change-me-change-me-0123456789", accessTtlSeconds: 900, refreshTtlDays: 7, bcryptRounds: 12 } },
  ],
  exports: [CLOCK, CONFIG],
})
export class CoreModule {}

// הבודק משתמש ב־UsersService.create(email, password, role) כדי ליצור admin
@Injectable()
export class UsersService {
  async create(email: string, password: string, role: "user" | "admin" = "user"): Promise<unknown> {
    return undefined; // כתוב כאן
  }
}

// כתוב כאן כל השאר

@Module({
  imports: [CoreModule],
  controllers: [],
  providers: [UsersService],
})
export class BookmarksAppModule {}
