import { Global, Inject, Module, OnApplicationShutdown } from "@nestjs/common";
import { Redis } from "ioredis";
import { CONFIG, type AppConfig } from "../config";
import { CacheService } from "./cache.service";
import { REDIS } from "./redis.tokens";

export { REDIS } from "./redis.tokens";

// חיבור אחד ל־Redis לכל האפליקציה — או null כשאין REDIS_URL (ואז הכול עובד, רק בלי cache ובלי תור)
@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [CONFIG],
      useFactory: (config: AppConfig) =>
        config.redis ? new Redis(config.redis.url, { keyPrefix: `${config.redis.prefix}:`, maxRetriesPerRequest: 2, enableOfflineQueue: false }) : null,
    },
    CacheService,
  ],
  exports: [REDIS, CacheService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis | null) {}

  async onApplicationShutdown() {
    await this.redis?.quit().catch(() => this.redis?.disconnect());
  }
}
