import { Body, Controller, Delete, Get, HttpCode, Param, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { type AuthUser, CurrentUser } from "../auth/auth.decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { idSchema } from "../products/products.schema";
import { CartService } from "./cart.service";

const quantitySchema = z.strictObject({ quantity: z.number().int().min(0).max(100) });

@ApiTags("cart")
@ApiBearerAuth()
@Controller("cart")
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  view(@CurrentUser() user: AuthUser) {
    return this.cart.view(user.id);
  }

  // PUT = "הכמות היא X" (idempotent): לחיצה כפולה לא מכפילה
  @Put("items/:productId")
  @ApiBody({ schema: z.toJSONSchema(quantitySchema) as object })
  set(@CurrentUser() user: AuthUser, @Param("productId", new ZodValidationPipe(idSchema)) productId: number, @Body(new ZodValidationPipe(quantitySchema)) body: { quantity: number }) {
    return this.cart.setQuantity(user.id, productId, body.quantity);
  }

  @Delete("items/:productId")
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param("productId", new ZodValidationPipe(idSchema)) productId: number) {
    await this.cart.setQuantity(user.id, productId, 0);
  }

  @Delete()
  @HttpCode(204)
  clear(@CurrentUser() user: AuthUser) {
    return this.cart.clear(user.id);
  }
}
