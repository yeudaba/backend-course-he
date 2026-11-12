// P26-E95: גוף מייל האישור
type Order = { id: number; user: { name: string; email: string }; items: { name: string; quantity: number; priceCents: number }[]; totalCents: number };

const money = (cents: number) => `₪${(cents / 100).toFixed(2)}`;

export function confirmationEmail(order: Order) {
  const lines = order.items.map((i) => `${i.name} × ${i.quantity} — ${money(i.priceCents * i.quantity)}`);
  return {
    to: order.user.email,
    subject: `אישור הזמנה #${order.id}`,
    body: [`שלום ${order.user.name},`, "", ...lines, "", `סה״כ: ${money(order.totalCents)}`].join("\n"),
  };
}
