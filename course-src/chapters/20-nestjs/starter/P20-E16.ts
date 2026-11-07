// P20-E16: ParsePositiveIntPipe — "7" ← 7; כל דבר אחר ← 400 "id חייב להיות מספר שלם חיובי"
import { ArgumentMetadata, BadRequestException, Controller, Get, Injectable, Module, Param, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    return Number(value); // כתוב כאן
  }
}

@Controller("items")
export class ItemsController {
  @Get(":id")
  findOne(@Param("id") id: number) {
    return { id, type: typeof id };
  }
}

@Module({ controllers: [ItemsController] })
export class ItemsModule {}
