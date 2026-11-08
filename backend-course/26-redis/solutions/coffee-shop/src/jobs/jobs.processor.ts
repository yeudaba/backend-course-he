import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { type Job, Worker } from "bullmq";
import { CONFIG, type AppConfig } from "../config";
import { EmailsService } from "../emails/emails.service";
import { OrdersService } from "../orders/orders.service";
import { bullConnection, type JobName, QUEUE_NAME } from "./jobs.service";

// ה־worker: מקבל עבודות מהתור ומריץ אותן. כאן — באותו תהליך כמו ה־API (WORKER=true);
// בהיקף גדול — תהליך נפרד (WORKER=false ב־API, ו־instance נוסף שרק מעבד)
@Injectable()
export class JobsProcessor implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger("JobsProcessor");
  private worker: Worker | null = null;

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly orders: OrdersService,
    private readonly emails: EmailsService,
  ) {}

  onApplicationBootstrap() {
    if (!this.config.redis || !this.config.runWorker) return;
    this.worker = new Worker(QUEUE_NAME, (job: Job<{ orderId: number }>) => this.handle(job), {
      connection: bullConnection(this.config.redis.url),
      prefix: `${this.config.redis.prefix}:bull`,
      concurrency: 5,
    });
    this.worker.on("failed", (job, err) => this.logger.warn(`${job?.name} #${job?.data.orderId} נכשל (ניסיון ${job?.attemptsMade}): ${err.message}`));
  }

  async handle(job: Job<{ orderId: number }>) {
    switch (job.name as JobName) {
      case "order-confirmation":
        return this.emails.sendOrderConfirmation(job.data.orderId);
      case "expire-order":
        return this.orders.expire(job.data.orderId);
      default:
        throw new Error(`עבודה לא מוכרת: ${job.name}`);
    }
  }

  async onApplicationShutdown() {
    await this.worker?.close(); // מחכה שהעבודות שבאמצע יסתיימו (graceful, פרק 24)
  }
}
