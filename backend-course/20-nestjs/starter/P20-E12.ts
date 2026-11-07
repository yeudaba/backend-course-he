// P20-E12: כל שגיאת HTTP ← { error: { code, message, details? } }
import {
  ArgumentsHost, BadRequestException, Body, Catch, Controller, ExceptionFilter, Get, HttpException,
  Module, NotFoundException, Param, ParseIntPipe, Post, ValidationPipe, type ValidationError,
} from "@nestjs/common";
import { IsString, Length } from "class-validator";
import type { Response } from "express";

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // כתוב כאן
  }
}

export function validationPipe() {
  return new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
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
