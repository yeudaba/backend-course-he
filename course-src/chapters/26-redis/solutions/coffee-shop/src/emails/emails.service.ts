import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// "שליחת מייל" מדומה: נכתב לטבלת email_outbox, ומנהל רואה ב־GET /emails (כמו Mailtrap / MailHog בפיתוח)
@Injectable()
export class EmailsService {
  private readonly logger = new Logger("EmailsService");

  constructor(private readonly prisma: PrismaService) {}

  async sendOrderConfirmation(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { user: true, items: true } });
    if (!order || order.status === "cancelled") return "skipped";
    const lines = order.items.map((i) => `${i.name} × ${i.quantity} — ₪${((i.priceCents * i.quantity) / 100).toFixed(2)}`);
    try {
      await this.prisma.emailMessage.create({
        data: {
          kind: "order-confirmation",
          orderId,
          to: order.user.email,
          subject: `אישור הזמנה #${orderId}`,
          body: [`שלום ${order.user.name},`, "", ...lines, "", `סה״כ: ₪${(order.totalCents / 100).toFixed(2)}`].join("\n"),
        },
      });
    } catch (err) {
      // כבר נשלח (retry של העבודה, או הוספה כפולה לתור) — "consumer idempotent": לא שולחים פעמיים
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return "duplicate";
      throw err;
    }
    this.logger.log(`order-confirmation → ${order.user.email} (#${orderId})`);
    return "sent";
  }

  list() {
    return this.prisma.emailMessage.findMany({ orderBy: { id: "desc" }, take: 50 });
  }
}
