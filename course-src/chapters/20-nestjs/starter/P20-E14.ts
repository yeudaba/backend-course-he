// P20-E14: GET /public פתוח, GET /secret מוגן ב־ApiKeyGuard. המפתחות — מ־provider בשם API_KEYS
import {
  CanActivate, Controller, ExecutionContext, ForbiddenException, Get, Inject, Injectable, Module,
  UnauthorizedException, UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

export const API_KEYS = "API_KEYS";

// כתוב כאן ApiKeyGuard ו־SecretController

@Module({ controllers: [], providers: [] })
export class SecretModule {}
