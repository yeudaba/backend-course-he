// P20-E24
import {
  ArgumentsHost, BadRequestException, Body, Catch, ConflictException, Controller, ExceptionFilter, Get, HttpCode,
  HttpException, Inject, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, Query, ValidationPipe,
  type ValidationError,
} from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";
import type { Response } from "express";

// ---------- tokens ----------
export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

// ---------- שגיאות: { error: { code, message, details? } } ----------
const apiError = (code: string, message: string, details?: unknown) => ({ code, message, ...(details ? { details } : {}) });
const CODES: Record<number, string> = { 400: "BAD_REQUEST", 404: "NOT_FOUND", 409: "CONFLICT" };

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const error = typeof body === "object" && body !== null && "code" in body ? body : apiError(CODES[status] ?? "ERROR", exception.message);
    res.status(status).json({ error });
  }
}

export function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException(apiError("VALIDATION_ERROR", "קלט לא תקין", errors.map((e) => ({ field: e.property, messages: Object.values(e.constraints ?? {}) })))),
  });
}

// ---------- DTOs ----------
export class CreateBookDto {
  @IsString() @Length(1, 200) title: string;
  @IsString() @Length(1, 200) author: string;
  @IsInt() @Min(1) @Max(100) copies: number;
}

export class ListBooksQuery {
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsIn(["true", "false"]) available?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit: number = 10;
}

export class CreateLoanDto {
  @IsString() @Length(1, 100) member: string;
}

// ---------- service ----------
export interface Book {
  id: number;
  title: string;
  author: string;
  copies: number;
  available: number;
}
export interface Loan {
  id: number;
  bookId: number;
  member: string;
  loanedAt: string;
  dueAt: string;
  returnedAt: string | null;
}

const LOAN_DAYS = 14;

@Injectable()
export class LibraryService {
  private readonly books: Book[] = [];
  private readonly loans: Loan[] = [];

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  createBook(dto: CreateBookDto): Book {
    const book = { id: this.books.length + 1, title: dto.title, author: dto.author, copies: dto.copies, available: dto.copies };
    this.books.push(book);
    return book;
  }

  listBooks({ author, available, page, limit }: ListBooksQuery) {
    let books = this.books;
    if (author) books = books.filter((b) => b.author.toLowerCase().includes(author.toLowerCase()));
    if (available === "true") books = books.filter((b) => b.available > 0);
    return { data: books.slice((page - 1) * limit, page * limit), meta: { page, limit, total: books.length, totalPages: Math.ceil(books.length / limit) } };
  }

  getBook(id: number): Book {
    const book = this.books.find((b) => b.id === id);
    if (!book) throw new NotFoundException(apiError("BOOK_NOT_FOUND", `ספר ${id} לא נמצא`));
    return book;
  }

  lend(bookId: number, member: string): Loan {
    const book = this.getBook(bookId);
    if (this.loans.some((l) => l.bookId === bookId && l.member === member && l.returnedAt === null)) {
      throw new ConflictException(apiError("ALREADY_BORROWED", `${member} כבר מחזיק/ה את הספר`));
    }
    if (book.available === 0) throw new ConflictException(apiError("NO_COPIES", "אין עותק פנוי"));
    const now = this.clock.now();
    const loan = {
      id: this.loans.length + 1,
      bookId,
      member,
      loanedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      returnedAt: null,
    };
    this.loans.push(loan);
    book.available--;
    return loan;
  }

  returnLoan(id: number): Loan {
    const loan = this.loans.find((l) => l.id === id);
    if (!loan) throw new NotFoundException(apiError("LOAN_NOT_FOUND", `השאלה ${id} לא נמצאה`));
    if (loan.returnedAt) throw new ConflictException(apiError("ALREADY_RETURNED", "ההשאלה כבר הוחזרה"));
    loan.returnedAt = this.clock.now().toISOString();
    this.getBook(loan.bookId).available++;
    return loan;
  }

  overdue(): Loan[] {
    const now = this.clock.now().getTime();
    return this.loans.filter((l) => l.returnedAt === null && new Date(l.dueAt).getTime() < now);
  }
}

// ---------- controllers ----------
@Controller("books")
export class BooksController {
  constructor(private readonly library: LibraryService) {}

  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.library.createBook(dto);
  }

  @Get()
  list(@Query() query: ListBooksQuery) {
    return this.library.listBooks(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.library.getBook(id);
  }

  @Post(":id/loans")
  lend(@Param("id", ParseIntPipe) id: number, @Body() dto: CreateLoanDto) {
    return this.library.lend(id, dto.member);
  }
}

@Controller("loans")
export class LoansController {
  constructor(private readonly library: LibraryService) {}

  @Get("overdue") // לפני כל ":id"
  overdue() {
    return this.library.overdue();
  }

  @Post(":id/return")
  @HttpCode(200)
  returnLoan(@Param("id", ParseIntPipe) id: number) {
    return this.library.returnLoan(id);
  }
}

@Module({
  controllers: [BooksController, LoansController],
  providers: [
    LibraryService,
    { provide: CLOCK, useValue: { now: () => new Date() } },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_PIPE, useFactory: createValidationPipe },
  ],
})
export class LibraryModule {}
