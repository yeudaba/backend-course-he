// P20-E15: interceptor שמודד זמן: header X-Response-Time ושורת לוג "GET /ping 200 3ms"
import { CallHandler, Controller, ExecutionContext, Get, Inject, Injectable, Module, NestInterceptor } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import type { Request, Response } from "express";
import { Observable, tap } from "rxjs";

export const LOGGER = "LOGGER";
export interface Logger {
  log(line: string): void;
}

// כתוב כאן TimingInterceptor

@Controller()
export class PingController {
  @Get("ping")
  ping() {
    return { pong: true };
  }

  @Get("slow")
  async slow() {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return { done: true };
  }
}

@Module({ controllers: [PingController], providers: [] })
export class PingModule {}
