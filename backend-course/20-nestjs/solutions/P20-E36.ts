// P20-E36: AppModule שמייבא שני modules
import { Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}

@Injectable()
export class CatalogService {
  private items = [
    { id: 1, name: "Mug" },
    { id: 2, name: "Kettle" },
    { id: 3, name: "Filters" },
  ];
  findOne(id: number) {
    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`פריט ${id} לא נמצא`);
    return item;
  }
}

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.catalog.findOne(id);
  }
}

@Module({ controllers: [CatalogController], providers: [CatalogService] })
export class CatalogModule {}

@Module({ imports: [HealthModule, CatalogModule] })
export class AppModule {}
