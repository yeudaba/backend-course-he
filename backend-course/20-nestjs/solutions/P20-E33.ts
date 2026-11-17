// P20-E33: GET /status
import { Controller, Get, Module } from "@nestjs/common";

@Controller("status")
export class StatusController {
  @Get()
  status() {
    return { status: "ok", version: "1.0.0" };
  }
}

@Module({ controllers: [StatusController] })
export class StatusModule {}
