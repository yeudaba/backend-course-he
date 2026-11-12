// P20-E73: תיעוד — tags, דוגמאות ו־404
import { Body, Controller, Get, INestApplication, Module, NotFoundException, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ApiNotFoundResponse, ApiProperty, ApiPropertyOptional, ApiTags, DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Length } from "class-validator";

export class CreateBookDto {
  @ApiProperty({ example: "Dune" })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty({ example: 1965 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: "978-0441013593" })
  @IsOptional()
  @IsString()
  isbn?: string;
}

@ApiTags("books")
@Controller("books")
export class BooksController {
  private books: (CreateBookDto & { id: number })[] = [];

  @Post()
  create(@Body() dto: CreateBookDto) {
    const book = { id: this.books.length + 1, ...dto };
    this.books.push(book);
    return book;
  }

  @Get()
  list() {
    return this.books;
  }

  @Get(":id")
  @ApiNotFoundResponse({ description: "הספר לא נמצא" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    const book = this.books.find((b) => b.id === id);
    if (!book) throw new NotFoundException(`ספר ${id} לא נמצא`);
    return book;
  }
}

@Module({ controllers: [BooksController] })
export class BooksModule {}

export function setupDocs(app: INestApplication) {
  const config = new DocumentBuilder().setTitle("Library API").setVersion("2.0").build();
  SwaggerModule.setup("docs", app, () => SwaggerModule.createDocument(app, config));
}
