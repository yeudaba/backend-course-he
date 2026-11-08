import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { Public, Roles } from "../auth/auth.decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { type CreateProductInput, createProductSchema, idSchema, type ListQuery, listQuerySchema, type UpdateProductInput, updateProductSchema } from "./products.schema";
import { ProductsService } from "./products.service";

const idPipe = new ZodValidationPipe(idSchema);

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    return this.products.list(query);
  }

  @Public()
  @Get(":id")
  get(@Param("id", idPipe) id: number) {
    return this.products.get(id);
  }

  @Post()
  @Roles("admin")
  @ApiBearerAuth()
  @ApiBody({ schema: z.toJSONSchema(createProductSchema, { io: "input" }) as object })
  create(@Body(new ZodValidationPipe(createProductSchema)) body: CreateProductInput) {
    return this.products.create(body);
  }

  @Patch(":id")
  @Roles("admin")
  @ApiBearerAuth()
  @ApiBody({ schema: z.toJSONSchema(createProductSchema.partial(), { io: "input" }) as object })
  update(@Param("id", idPipe) id: number, @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductInput) {
    return this.products.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles("admin")
  @ApiBearerAuth()
  remove(@Param("id", idPipe) id: number) {
    return this.products.remove(id);
  }
}
