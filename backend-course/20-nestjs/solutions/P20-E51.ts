// P20-E51: אירועים — Query DTO עם תאריכים ורשימה סגורה
import { BadRequestException, Controller, Get, Module, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

const EVENTS = [
  { id: 1, title: "Latte Art", city: "tel-aviv", date: "2026-12-01" },
  { id: 2, title: "Cupping", city: "haifa", date: "2026-11-20" },
  { id: 3, title: "Roasting 101", city: "tel-aviv", date: "2027-01-15" },
  { id: 4, title: "Espresso Lab", city: "jerusalem", date: "2026-12-10" },
  { id: 5, title: "Pour Over", city: "haifa", date: "2027-02-02" },
];

export class EventsQuery {
  @IsOptional()
  @IsIn(["tel-aviv", "haifa", "jerusalem"])
  city?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 10;
}

@Controller("events")
export class EventsController {
  @Get()
  list(@Query() q: EventsQuery) {
    if (q.from && q.to && q.from > q.to) throw new BadRequestException("from חייב להיות לפני to");
    return EVENTS.filter((e) => (!q.city || e.city === q.city) && (!q.from || e.date >= q.from) && (!q.to || e.date <= q.to))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, q.limit);
  }
}

@Module({ controllers: [EventsController] })
export class EventsModule {}
