// P20-E25: אתגר — RateLimitGuard: חלון קבוע לכל לקוח, 429 + Retry-After
import {
  CanActivate, Controller, ExecutionContext, Get, HttpException, HttpStatus, Inject, Injectable, Module, UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";

export const CLOCK = "CLOCK";
export const RATE_LIMIT = "RATE_LIMIT";
export interface Clock {
  now(): Date;
}
export interface RateLimitOptions {
  limit: number; // כמה בקשות מותר בחלון
  windowMs: number; // אורך החלון
}

// כתוב כאן RateLimitGuard

@Controller("data")
export class DataController {
  @Get()
  get() {
    return { data: [1, 2, 3] };
  }
}

@Module({
  controllers: [DataController],
  providers: [
    { provide: RATE_LIMIT, useValue: { limit: 5, windowMs: 60_000 } },
    { provide: CLOCK, useValue: { now: () => new Date() } },
  ],
})
export class DataModule {}
