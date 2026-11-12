// P20-E83: /health עם בדיקת מסד ו־timeout
import { Controller, Get, HttpException, Inject, Module } from "@nestjs/common";

export const DB_PING = "DB_PING";

@Controller("health")
export class HealthController {
  constructor(@Inject(DB_PING) private readonly ping: () => Promise<void>) {}

  @Get()
  async check() {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), 200);
    });
    try {
      await Promise.race([this.ping(), timeout]);
      return { status: "ok", checks: { db: "up" } };
    } catch {
      throw new HttpException({ status: "error", checks: { db: "down" } }, 503);
    } finally {
      clearTimeout(timer);
    }
  }
}

@Module({ controllers: [HealthController], providers: [{ provide: DB_PING, useValue: async () => {} }] })
export class HealthModule {}
