import { Inject, Injectable } from "@nestjs/common";
import type { AuthUser } from "../auth/auth.decorators";
import { CLOCK, type Clock } from "../config";
import { HttpError } from "../errors";
import type { Prisma } from "../generated/prisma/client";
import { PAYMENT_GATEWAY, type PaymentGateway, isValidCardNumber } from "../payments/payment-gateway";
import { PrismaService } from "../prisma/prisma.service";
import { fromStatuses, type OrderStatus } from "./order-status";

const orderView = {
  id: true,
  userId: true,
  status: true,
  totalCents: true,
  createdAt: true,
  paidAt: true,
  shippedAt: true,
  cancelledAt: true,
  items: { select: { productId: true, name: true, priceCents: true, quantity: true }, orderBy: { productId: "asc" } },
} satisfies Prisma.OrderSelect;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY) private readonly payments: PaymentGateway,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  // עגלה ← הזמנה, בטרנזקציה אחת: או שהכול קורה (מלאי ירד, הזמנה נוצרה, עגלה התרוקנה) — או כלום
  createFromCart(userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // לפי productId: שתי הזמנות עם אותם מוצרים נועלות אותם באותו סדר — בלי deadlock
      const cart = await tx.cartItem.findMany({ where: { userId, product: { active: true } }, orderBy: { productId: "asc" } });
      if (cart.length === 0) throw new HttpError(422, "CART_EMPTY", "העגלה ריקה");

      const shortages: { productId: number; requested: number; available: number }[] = [];
      for (const item of cart) {
        // UPDATE מותנה ואטומי: "הורד, רק אם יש מספיק". שני לקוחות על היחידה האחרונה — PostgreSQL נועל את השורה,
        // השני מחכה, ואחרי ה־COMMIT של הראשון התנאי כבר לא מתקיים: count = 0. בלי SELECT-ואז-UPDATE
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, active: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          const p = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
          shortages.push({ productId: item.productId, requested: item.quantity, available: p?.stock ?? 0 });
        }
      }
      // זריקה בתוך $transaction = ROLLBACK: גם מה שכבר ירד מהמלאי — חוזר
      if (shortages.length > 0) throw new HttpError(409, "OUT_OF_STOCK", "חלק מהמוצרים אזלו", shortages);

      // המחיר והשם — עכשיו, אחרי שהשורות נעולות: זה המחיר שהלקוח משלם, גם אם ישתנה מחר
      const products = await tx.product.findMany({ where: { id: { in: cart.map((c) => c.productId) } }, select: { id: true, name: true, priceCents: true } });
      const byId = new Map(products.map((p) => [p.id, p]));
      const items = cart.map((c) => ({ productId: c.productId, name: byId.get(c.productId)!.name, priceCents: byId.get(c.productId)!.priceCents, quantity: c.quantity }));
      const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

      const order = await tx.order.create({ data: { userId, totalCents, createdAt: this.clock.now(), items: { create: items } }, select: orderView });
      await tx.cartItem.deleteMany({ where: { userId } });
      return order;
    });
  }

  async list(user: AuthUser, { status, page, limit }: { status?: OrderStatus; page: number; limit: number }) {
    const where: Prisma.OrderWhereInput = { ...(user.role === "admin" ? {} : { userId: user.id }), ...(status ? { status } : {}) };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({ where, select: orderView, orderBy: { id: "desc" }, skip: (page - 1) * limit, take: limit }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // של משתמש אחר ← 404, לא 403: לא מגלים שההזמנה בכלל קיימת (פרק 21)
  async get(user: AuthUser, id: number) {
    const order = await this.prisma.order.findFirst({ where: { id, ...(user.role === "admin" ? {} : { userId: user.id }) }, select: orderView });
    if (!order) throw new HttpError(404, "ORDER_NOT_FOUND", `הזמנה ${id} לא נמצאה`);
    return order;
  }

  async pay(user: AuthUser, id: number, cardNumber: string) {
    if (!isValidCardNumber(cardNumber)) throw new HttpError(400, "VALIDATION_ERROR", "מספר כרטיס לא תקין", [{ path: "body.cardNumber", message: "מספר כרטיס לא תקין" }]);
    const order = await this.get(user, id);
    if (order.status !== "pending_payment") throw new HttpError(409, "ORDER_NOT_PAYABLE", `אי אפשר לשלם על הזמנה במצב ${order.status}`);

    const result = await this.payments.charge(order.totalCents, cardNumber);
    const last4 = cardNumber.slice(-4); // לעולם לא שומרים מספר כרטיס מלא
    if (!result.ok) {
      await this.prisma.payment.create({ data: { orderId: id, amountCents: order.totalCents, status: "declined", last4, reference: result.reference } });
      throw new HttpError(402, "PAYMENT_DECLINED", result.reason === "insufficient_funds" ? "אין כיסוי בכרטיס" : "התשלום נדחה", [{ reason: result.reason }]);
    }
    // מעבר מותנה: רק אם עדיין pending_payment. אם בינתיים בוטלה — מחזירים את הכסף
    const paid = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({ where: { id, status: "pending_payment" }, data: { status: "paid", paidAt: this.clock.now() } });
      await tx.payment.create({ data: { orderId: id, amountCents: order.totalCents, status: "succeeded", last4, reference: result.reference } });
      return count === 1;
    });
    if (!paid) {
      const refund = await this.payments.refund(result.reference, order.totalCents);
      await this.prisma.payment.create({ data: { orderId: id, amountCents: order.totalCents, status: "refunded", last4, reference: refund.reference } });
      throw new HttpError(409, "ORDER_NOT_PAYABLE", "ההזמנה שונתה בזמן התשלום; החיוב בוטל");
    }
    return this.get(user, id);
  }

  async cancel(user: AuthUser, id: number) {
    const order = await this.get(user, id);
    const wasPaid = await this.prisma.$transaction(async (tx) => {
      // מעבר מותנה — גם מגן מביטול כפול במקביל: רק אחד מקבל count = 1, ורק הוא מחזיר מלאי
      const { count } = await tx.order.updateMany({ where: { id, status: { in: fromStatuses("cancel") } }, data: { status: "cancelled", cancelledAt: this.clock.now() } });
      if (count === 0) throw new HttpError(409, "ORDER_NOT_CANCELLABLE", `אי אפשר לבטל הזמנה במצב ${order.status}`);
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      return order.status === "paid";
    });
    if (wasPaid) {
      const charge = await this.prisma.payment.findFirst({ where: { orderId: id, status: "succeeded" }, orderBy: { id: "desc" } });
      if (charge) {
        const refund = await this.payments.refund(charge.reference, charge.amountCents);
        await this.prisma.payment.create({ data: { orderId: id, amountCents: charge.amountCents, status: "refunded", last4: charge.last4, reference: refund.reference } });
      }
    }
    return this.get(user, id);
  }

  async ship(admin: AuthUser, id: number) {
    const order = await this.get(admin, id);
    const { count } = await this.prisma.order.updateMany({ where: { id, status: { in: fromStatuses("ship") } }, data: { status: "shipped", shippedAt: this.clock.now() } });
    if (count === 0) throw new HttpError(409, "ORDER_NOT_SHIPPABLE", `אי אפשר לשלוח הזמנה במצב ${order.status}`);
    return this.get(admin, id);
  }
}
