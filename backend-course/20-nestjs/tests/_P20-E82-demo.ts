// אפליקציה קטנה לבודק של P20-E82 (לא תרגיל)
import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBookDto {
  @ApiProperty() title: string;
  @ApiProperty() year: number;
  @ApiPropertyOptional() isbn?: string;
}

@Controller("books")
export class BooksController {
  @Delete(":id") remove(@Param("id") id: string) { return id; }
  @Get(":id") one(@Param("id") id: string) { return id; }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: CreateBookDto) { return dto; }
  @Post() create(@Body() dto: CreateBookDto) { return dto; }
  @Get() list() { return []; }
}

@Module({ controllers: [BooksController] })
export class DemoModule {}
