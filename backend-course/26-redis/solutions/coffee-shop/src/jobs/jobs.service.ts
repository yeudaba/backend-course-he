import { Inject, Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import { Queue } from "bullmq";
import { CONFIG, type AppConfig } from "../config";

export const QUEUE_NAME = "shop";

export type JobName = "order-confirmation" | "expire-order";

// מוסיף עבודות לתור (BullMQ על Redis). jobId קבוע לכל (סוג, הזמנה): הוספה כפולה = עבודה אחת
@Injectable()
export class JobsService implements OnApplicationShutdown {
  private readonly logger = new Logger("JobsService");
  readonly queue: Queue | null;

  constructor(@Inject(CONFIG) config: AppConfig) {
    this.queue = config.redis ? new Queue(QUEUE_NAME, { connection: bullConnection(config.redis.url), prefix: `${config.redis.prefix}:bull` }) : null;
  }

  async add(name: JobName, orderId: number, delayMs = 0) {
    if (!this.queue) return false;
    await this.queue.add(
      name,
      { orderId },
      {
        jobId: `${name}-${orderId}`,
        delay: delayMs,
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
    this.logger.log(`queued ${name} #${orderId}${delayMs ? ` in ${delayMs}ms` : ""}`);
    return true;
  }

  async onApplicationShutdown() {
    await this.queue?.close();
  }
}

export function bullConnection(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    ...(u.username ? { username: decodeURIComponent(u.username) } : {}),
    ...(u.password ? { password: decodeURIComponent(u.password) } : {}),
    ...(u.protocol === "rediss:" ? { tls: {} } : {}),
    maxRetriesPerRequest: null, // Worker של BullMQ מחכה לעבודות בלי סוף
  };
}
