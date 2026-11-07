// P20-E24: אתגר — API לספרייה ב־Nest (המפרט המלא בדף התרגילים)
// כל שגיאה: { error: { code, message, details? } }. ה־filter וה־ValidationPipe נרשמים בתוך LibraryModule
// (APP_FILTER, APP_PIPE) — הבודק לא מוסיף שום הגדרה גלובלית.
import {
  ArgumentsHost, BadRequestException, Body, Catch, ConflictException, Controller, ExceptionFilter, Get, HttpCode,
  HttpException, Inject, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, Query, ValidationPipe,
  type ValidationError,
} from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";
import type { Response } from "express";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

// כתוב כאן: DTOs, LibraryService, BooksController, LoansController, filter

@Module({
  controllers: [],
  providers: [{ provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class LibraryModule {}
