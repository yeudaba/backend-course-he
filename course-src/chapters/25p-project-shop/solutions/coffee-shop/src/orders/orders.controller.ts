import { Body, Controller, Get, Headers, HttpCode, Param, Post, Query, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { z } from "zod";
import { type AuthUser, CurrentUser, Roles } from "../auth/auth.decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { IdempotencyService } from "../idempotency/idempotency.service";
import { idSchema } from "../products/products.schema";
import { OrdersService } from "./orders.service";

const idPipe = new ZodValidationPipe(idSchema);
const listSchema = z.strictObject({
  status: z.enum(["pending_payment", "paid", "shipped", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
const paySchema = z.strictObject({ cardNumber: z.string().trim().transform((s) => s.replace(/[\s-]/g, "")) });
const idempotencyHeader = { name: "Idempotency-Key", required: true, description: "מזהה ייחודי לפעולה — לחיצה כפולה לא יוצרת שתי הזמנות / שני חיובים" };

@ApiTags("orders")
@ApiBearerAuth()
@Controller("orders")
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly idempotency: IdempotencyService,
  ) {}

  @Post()
  @ApiHeader(idempotencyHeader)
  async create(@CurrentUser() user: AuthUser, @Headers("idempotency-key") key: string | undefined, @Res({ passthrough: true }) res: Response) {
    const r = await this.idempotency.run(user.id, key, "POST /orders", null, async () => ({ status: 201, body: await this.orders.createFromCart(user.id) }));
    return this.reply(res, r);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query(new ZodValidationPipe(listSchema)) query: z.infer<typeof listSchema>) {
    return this.orders.list(user, query);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthUser, @Param("id", idPipe) id: number) {
    return this.orders.get(user, id);
  }

  @Post(":id/pay")
  @HttpCode(200)
  @ApiHeader(idempotencyHeader)
  @ApiBody({ schema: { type: "object", properties: { cardNumber: { type: "string", example: "4242424242424242" } } } })
  async pay(
    @CurrentUser() user: AuthUser,
    @Param("id", idPipe) id: number,
    @Body(new ZodValidationPipe(paySchema)) body: { cardNumber: string },
    @Headers("idempotency-key") key: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    // בטביעה: רק 4 הספרות האחרונות — לא שומרים מספר כרטיס, גם לא ב־hash
    const r = await this.idempotency.run(user.id, key, `POST /orders/${id}/pay`, body.cardNumber.slice(-4), async () => ({ status: 200, body: await this.orders.pay(user, id, body.cardNumber) }));
    return this.reply(res, r);
  }

  @Post(":id/cancel")
  @HttpCode(200)
  cancel(@CurrentUser() user: AuthUser, @Param("id", idPipe) id: number) {
    return this.orders.cancel(user, id);
  }

  @Post(":id/ship")
  @HttpCode(200)
  @Roles("admin")
  ship(@CurrentUser() user: AuthUser, @Param("id", idPipe) id: number) {
    return this.orders.ship(user, id);
  }

  private reply<T>(res: Response, r: { status: number; body: T; replayed: boolean }) {
    res.status(r.status);
    if (r.replayed) res.setHeader("Idempotent-Replayed", "true");
    return r.body;
  }
}
