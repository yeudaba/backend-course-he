// P21-E11: guard גלובלי (APP_GUARD), @Public() ו־@CurrentUser()
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
// כתוב כאן: Public, CurrentUser, JwtAuthGuard

@Controller("notes")
export class NotesController {
  @Get("mine")
  mine() {
    return { owner: 0, notes: [] }; // כתוב כאן: עם @CurrentUser()
  }

  @Get("public")
  publicNotes() {
    return { notes: ["פתק לכולם"] };
  }
}

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
  providers: [],
})
export class NotesModule {}
