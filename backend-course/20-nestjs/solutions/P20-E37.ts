// P20-E37: ריבוע של מספר
import { Controller, Get, Module, Param, ParseIntPipe } from "@nestjs/common";

@Controller()
export class MathController {
  @Get("square/:n")
  square(@Param("n", ParseIntPipe) n: number) {
    return { n, square: n * n };
  }
}

@Module({ controllers: [MathController] })
export class MathModule {}
