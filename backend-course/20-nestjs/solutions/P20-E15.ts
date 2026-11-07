// P20-E15
import { CallHandler, Controller, ExecutionContext, Get, Inject, Injectable, Module, NestInterceptor } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import type { Request, Response } from "express";
import { Observable, tap } from "rxjs";

export const LOGGER = "LOGGER";
export interface Logger {
  log(line: string): void;
}

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    return next.handle().pipe(
      tap(() => {
        // רץ אחרי ה־handler, לפני ש־Nest שולח את התשובה — לכן עוד אפשר להוסיף header
        const ms = Date.now() - start;
        res.setHeader("X-Response-Time", `${ms}ms`);
        this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
      }),
    );
  }
}

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

@Module({
  controllers: [PingController],
  providers: [
    { provide: LOGGER, useValue: console },
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
  ],
})
export class PingModule {}
