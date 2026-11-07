// P20-E21: מתוקן
import { Body, Controller, Get, Module, NotFoundException, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class ListReportsQuery {
  @IsOptional()
  @Type(() => Number) // ← תקלה 1: בלי זה "2" נשאר מחרוזת ו־@IsInt נכשל
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 5;
}

export class CreateReportDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsOptional() // ← תקלה 2: שדה בלי decorators "לא קיים" מבחינת whitelist
  @IsString()
  @Length(0, 1000)
  note?: string;
}

interface Report {
  id: number;
  title: string;
  note: string | null;
}

@Controller("reports")
export class ReportsController {
  private readonly reports: Report[] = [];

  @Get()
  list(@Query() query: ListReportsQuery) {
    const start = (query.page - 1) * query.limit;
    return { page: query.page, limit: query.limit, data: this.reports.slice(start, start + query.limit) };
  }

  @Post()
  create(@Body() dto: CreateReportDto) {
    const report = { id: this.reports.length + 1, title: dto.title, note: dto.note ?? null };
    this.reports.push(report);
    return report;
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    const report = this.reports.find((r) => r.id === id);
    if (!report) throw new NotFoundException(`דוח ${id} לא נמצא`); // ← תקלה 3: throw "..." הופך ל־500
    return report;
  }
}

@Module({ controllers: [ReportsController] })
export class ReportsModule {}
