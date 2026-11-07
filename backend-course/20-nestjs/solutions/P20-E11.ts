// P20-E11
import { Controller, Get, Inject, Injectable, Module } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

@Injectable()
export class GreetingService {
  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  greeting(): string {
    const hour = this.clock.now().getUTCHours();
    if (hour >= 5 && hour < 12) return "בוקר טוב";
    if (hour >= 12 && hour < 17) return "צהריים טובים";
    if (hour >= 17 && hour < 21) return "ערב טוב";
    return "לילה טוב";
  }
}

@Controller("greeting")
export class GreetingController {
  constructor(private readonly greetings: GreetingService) {}

  @Get()
  get() {
    return { greeting: this.greetings.greeting() };
  }
}

@Module({
  controllers: [GreetingController],
  providers: [GreetingService, { provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class GreetingModule {}
