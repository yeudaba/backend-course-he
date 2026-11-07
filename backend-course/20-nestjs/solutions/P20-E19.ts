// P20-E19
import { Body, Controller, Get, Module, Post, type INestApplication } from "@nestjs/common";
import { ApiCreatedResponse, ApiProperty, ApiTags, DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class CreateBookDto {
  @ApiProperty({ example: "Dune", minLength: 1, maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty({ example: 1965, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2100)
  year?: number;
}

export class BookDto extends CreateBookDto {
  @ApiProperty({ example: 1 })
  id: number;
}

@ApiTags("books")
@Controller("books")
export class BooksController {
  private readonly books: BookDto[] = [];

  @Get()
  list() {
    return this.books;
  }

  @Post()
  @ApiCreatedResponse({ type: BookDto })
  create(@Body() dto: CreateBookDto): BookDto {
    const book = { id: this.books.length + 1, ...dto };
    this.books.push(book);
    return book;
  }
}

@Module({ controllers: [BooksController] })
export class BooksModule {}

export function setupDocs(app: INestApplication) {
  const config = new DocumentBuilder().setTitle("Library API").setDescription("ספרים").setVersion("1.0").build();
  SwaggerModule.setup("docs", app, () => SwaggerModule.createDocument(app, config));
}
