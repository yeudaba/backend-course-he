// P20-E09: POST, GET /:id, PATCH /:id (PartialType), DELETE /:id ← 204
import { Body, Controller, Delete, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PartialType } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString, Length, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}

// כתוב כאן UpdateProductDto, ProductsService ו־ProductsController

@Module({ controllers: [], providers: [] })
export class ProductsModule {}
