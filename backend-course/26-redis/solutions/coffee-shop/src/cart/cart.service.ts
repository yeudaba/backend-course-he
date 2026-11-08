import { Injectable } from "@nestjs/common";
import { HttpError } from "../errors";
import { PrismaService } from "../prisma/prisma.service";

export interface CartView {
  items: { productId: number; name: string; priceCents: number; quantity: number; lineTotalCents: number; inStock: boolean }[];
  totalCents: number;
}

// העגלה היא "כוונה", לא שמירת מלאי: המחיר והמלאי נבדקים שוב ברגע ההזמנה
@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async view(userId: number): Promise<CartView> {
    const rows = await this.prisma.cartItem.findMany({
      where: { userId, product: { active: true } },
      include: { product: { select: { name: true, priceCents: true, stock: true } } },
      orderBy: { productId: "asc" },
    });
    const items = rows.map((r) => ({
      productId: r.productId,
      name: r.product.name,
      priceCents: r.product.priceCents,
      quantity: r.quantity,
      lineTotalCents: r.product.priceCents * r.quantity,
      inStock: r.product.stock >= r.quantity,
    }));
    return { items, totalCents: items.reduce((sum, i) => sum + i.lineTotalCents, 0) };
  }

  async setQuantity(userId: number, productId: number, quantity: number): Promise<CartView> {
    const product = await this.prisma.product.findFirst({ where: { id: productId, active: true }, select: { stock: true } });
    if (!product) throw new HttpError(404, "PRODUCT_NOT_FOUND", `מוצר ${productId} לא נמצא`);
    if (quantity === 0) {
      await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
    } else {
      if (quantity > product.stock) {
        throw new HttpError(409, "OUT_OF_STOCK", "אין מספיק במלאי", [{ productId, requested: quantity, available: product.stock }]);
      }
      await this.prisma.cartItem.upsert({ where: { userId_productId: { userId, productId } }, create: { userId, productId, quantity }, update: { quantity } });
    }
    return this.view(userId);
  }

  async clear(userId: number) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
