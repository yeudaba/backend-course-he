// P20-E08: CreateProductDto עם class-validator, POST /products ← 201, GET /products
import { Body, Controller, Get, Injectable, Module, Post } from "@nestjs/common";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class CreateProductDto {
  // name: 2–80 תווים | price: עד 2 ספרות אחרי הנקודה, 0.01–100,000 | stock: שלם ≥ 0 | isActive: בוליאני, אופציונלי
}

// כתוב כאן ProductsService ו־ProductsController

@Module({ controllers: [], providers: [] })
export class ProductsModule {}
