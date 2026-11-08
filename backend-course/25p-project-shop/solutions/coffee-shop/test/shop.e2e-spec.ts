import { createTestApp } from "./app";

describe("החנות (e2e, PostgreSQL אמיתי)", () => {
  let t: Awaited<ReturnType<typeof createTestApp>>;
  let admin: Record<string, string>;
  let key = 0;
  const idem = () => ({ "Idempotency-Key": `e2e-key-${++key}-${Date.now()}` });

  beforeAll(async () => {
    t = await createTestApp();
    admin = await t.admin();
  });
  afterAll(() => t?.close());

  const product = async (stock: number, priceCents = 1000) =>
    (await t.http().post("/products").set(admin).send({ name: "מוצר", priceCents, stock, category: "test" }).expect(201)).body as { id: number };

  it("הזמנה מלאה: עגלה ← הזמנה ← תשלום ← משלוח", async () => {
    const p = await product(5, 24900);
    const dana = await t.customer();
    await t.http().put(`/cart/items/${p.id}`).set(dana).send({ quantity: 2 }).expect(200);
    const order = (await t.http().post("/orders").set(dana).set(idem()).expect(201)).body;
    expect(order).toMatchObject({ status: "pending_payment", totalCents: 49800 });
    await t.http().post(`/orders/${order.id}/pay`).set(dana).set(idem()).send({ cardNumber: "4000000000000002" }).expect(402);
    await t.http().post(`/orders/${order.id}/pay`).set(dana).set(idem()).send({ cardNumber: "4242424242424242" }).expect(200);
    await t.http().post(`/orders/${order.id}/ship`).set(admin).expect(200);
    const payments = await t.prisma.payment.findMany({ where: { orderId: order.id }, orderBy: { id: "asc" } });
    expect(payments.map((x) => [x.status, x.last4])).toEqual([["declined", "0002"], ["succeeded", "4242"]]);
  });

  it("מרוץ: 10 לקוחות, 3 במלאי — בדיוק 3 הזמנות, ומלאי 0", async () => {
    const p = await product(3);
    const users = await Promise.all(Array.from({ length: 10 }, () => t.customer()));
    for (const u of users) await t.http().put(`/cart/items/${p.id}`).set(u).send({ quantity: 1 }).expect(200);
    const results = await Promise.all(users.map((u) => t.http().post("/orders").set(u).set(idem())));
    expect(results.filter((r) => r.status === 201)).toHaveLength(3);
    expect(results.filter((r) => r.status === 409).every((r) => r.body.error.code === "OUT_OF_STOCK")).toBe(true);
    expect((await t.prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stock).toBe(0);
  });

  it("המסד דוחה מלאי שלילי גם בלי הקוד (CHECK)", async () => {
    const p = await product(1);
    await expect(t.prisma.product.update({ where: { id: p.id }, data: { stock: -1 } })).rejects.toThrow(/products_stock_non_negative/);
  });

  it("ביטול מחזיר מלאי", async () => {
    const p = await product(5);
    const dana = await t.customer();
    await t.http().put(`/cart/items/${p.id}`).set(dana).send({ quantity: 3 }).expect(200);
    const order = (await t.http().post("/orders").set(dana).set(idem()).expect(201)).body;
    await t.http().post(`/orders/${order.id}/cancel`).set(dana).expect(200);
    expect((await t.prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stock).toBe(5);
  });
});
