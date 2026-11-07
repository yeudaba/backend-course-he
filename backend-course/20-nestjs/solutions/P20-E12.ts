// P20-E12
import {
  ArgumentsHost, BadRequestException, Body, Catch, Controller, ExceptionFilter, Get, HttpException,
  Module, NotFoundException, Param, ParseIntPipe, Post, ValidationPipe, type ValidationError,
} from "@nestjs/common";
import { IsString, Length } from "class-validator";
import type { Response } from "express";

const CODES: Record<number, string> = { 400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT" };

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    // אם מי שזרק כבר נתן code (למשל ה־exceptionFactory למטה) — משתמשים בו
    if (typeof body === "object" && body !== null && "code" in body) {
      res.status(status).json({ error: body });
      return;
    }
    res.status(status).json({ error: { code: CODES[status] ?? "ERROR", message: exception.message } });
  }
}

export function validationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "קלט לא תקין",
        details: errors.map((e) => ({ field: e.property, messages: Object.values(e.constraints ?? {}) })),
      }),
  });
}

export class CreateItemDto {
  @IsString()
  @Length(1, 50)
  name: string;
}

@Controller("items")
export class ItemsController {
  private readonly items: { id: number; name: string }[] = [];

  @Post()
  create(@Body() dto: CreateItemDto) {
    const item = { id: this.items.length + 1, name: dto.name };
    this.items.push(item);
    return item;
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`פריט ${id} לא נמצא`);
    return item;
  }
}

@Module({ controllers: [ItemsController] })
export class ItemsModule {}
