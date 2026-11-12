// P20-E34: מונה ביקורים ב־service
import { Controller, Get, Injectable, Module } from "@nestjs/common";

@Injectable()
export class VisitsService {
  private count = 0;
  hit() {
    return ++this.count;
  }
  peek() {
    return this.count;
  }
}

@Controller("visits")
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Get()
  hit() {
    return { visits: this.visits.hit() };
  }

  @Get("peek")
  peek() {
    return { visits: this.visits.peek() };
  }
}

@Module({ controllers: [VisitsController], providers: [VisitsService] })
export class VisitsModule {}
