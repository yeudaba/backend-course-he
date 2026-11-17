// P26-E99: ה־worker — עבודה ← פונקציה
type Deps = { emails: { sendOrderConfirmation(orderId: number): Promise<string> }; orders: { expire(orderId: number): Promise<string> } };

export async function handleJob(job: { name: string; data: { orderId: number } }, deps: Deps): Promise<string> {
  switch (job.name) {
    case "order-confirmation":
      return deps.emails.sendOrderConfirmation(job.data.orderId);
    case "expire-order":
      return deps.orders.expire(job.data.orderId);
    default:
      throw new Error(`עבודה לא מוכרת: ${job.name}`);
  }
}
