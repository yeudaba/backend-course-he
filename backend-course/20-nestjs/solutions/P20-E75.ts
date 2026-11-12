// P20-E75: filter לכל שגיאה — גם JSON שבור ו־500
import { ArgumentsHost, BadRequestException, Body, Catch, Controller, ExceptionFilter, Get, HttpException, Module, NotFoundException, Param, Post } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import type { Response } from "express";

const CODES: Record<number, string> = { 400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT" };

@Catch()
export class AllErrorsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (exception instanceof BadRequestException && /JSON/i.test(exception.message)) {
      return res.status(400).json({ error: { code: "INVALID_JSON", message: "גוף הבקשה אינו JSON תקין" } });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return res.status(status).json({ error: { code: CODES[status] ?? "ERROR", message: exception.message } });
    }
    res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  }
}

@Controller("items")
export class ItemsController {
  @Get("boom/now")
  boom() {
    throw new Error("secret: db password");
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    if (id !== "1") throw new NotFoundException(`פריט ${id} לא נמצא`);
    return { id: 1 };
  }

  @Post()
  create(@Body() body: unknown) {
    return body;
  }
}

@Module({ controllers: [ItemsController], providers: [{ provide: APP_FILTER, useClass: AllErrorsFilter }] })
export class ItemsModule {}
