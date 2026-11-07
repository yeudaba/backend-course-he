// P20-E16
import { ArgumentMetadata, BadRequestException, Controller, Get, Injectable, Module, Param, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    if (!/^\d+$/.test(value) || Number(value) < 1) {
      throw new BadRequestException(`${metadata.data ?? "הערך"} חייב להיות מספר שלם חיובי`);
    }
    return Number(value);
  }
}

@Controller("items")
export class ItemsController {
  @Get(":id")
  findOne(@Param("id", ParsePositiveIntPipe) id: number) {
    return { id, type: typeof id };
  }
}

@Module({ controllers: [ItemsController] })
export class ItemsModule {}
