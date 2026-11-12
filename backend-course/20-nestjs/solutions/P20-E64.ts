// P20-E64: interceptor של idempotency
import { Body, CallHandler, Controller, ExecutionContext, Get, Inject, Injectable, Module, NestInterceptor, Post, UseInterceptors } from "@nestjs/common";
import type { Request, Response } from "express";
import { Observable, of, tap } from "rxjs";

export const IDEMPOTENCY_STORE = "IDEMPOTENCY_STORE";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(IDEMPOTENCY_STORE) private readonly store: Map<string, unknown>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const key = http.getRequest<Request>().get("idempotency-key");
    if (!key) return next.handle();
    if (this.store.has(key)) {
      http.getResponse<Response>().setHeader("Idempotent-Replayed", "true");
      return of(this.store.get(key));
    }
    return next.handle().pipe(tap((body) => this.store.set(key, body)));
  }
}

@Controller("payments")
export class PaymentsController {
  private payments: { id: number; amount: number }[] = [];

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  create(@Body() body: { amount: number }) {
    const p = { id: this.payments.length + 1, amount: body.amount };
    this.payments.push(p);
    return p;
  }

  @Get("count")
  count() {
    return { count: this.payments.length };
  }
}

@Module({
  controllers: [PaymentsController],
  providers: [IdempotencyInterceptor, { provide: IDEMPOTENCY_STORE, useFactory: () => new Map() }],
})
export class PaymentsModule {}
