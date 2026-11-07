// P20-E19: Swagger — setupDocs(app) ב־/docs, ו־DTOs עם @ApiProperty
import { Body, Controller, Get, Module, Post, type INestApplication } from "@nestjs/common";
import { ApiCreatedResponse, ApiProperty, ApiTags, DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class CreateBookDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2100)
  year?: number;
}

export class BookDto extends CreateBookDto {
  id: number;
}

@Controller("books")
export class BooksController {
  private readonly books: BookDto[] = [];

  @Get()
  list() {
    return this.books;
  }

  @Post()
  create(@Body() dto: CreateBookDto): BookDto {
    const book = { id: this.books.length + 1, ...dto };
    this.books.push(book);
    return book;
  }
}

@Module({ controllers: [BooksController] })
export class BooksModule {}

export function setupDocs(app: INestApplication) {
  // כתוב כאן
}
