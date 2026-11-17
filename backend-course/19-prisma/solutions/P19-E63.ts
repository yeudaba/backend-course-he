// P19-E63: @db.Date — מ־Date למחרוזת ובחזרה
export type ApiCustomer = { id: number; fullName: string; email: string; city: string | null; joinedOn: string };

export function toApiCustomer(c: { id: number; fullName: string; email: string; city: string | null; joinedOn: Date }): ApiCustomer {
  return { id: c.id, fullName: c.fullName, email: c.email, city: c.city, joinedOn: c.joinedOn.toISOString().slice(0, 10) };
}

export function toCustomerData(body: { fullName: string; email: string; city?: string | null; joinedOn: string }) {
  const d = new Date(`${body.joinedOn}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.joinedOn) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== body.joinedOn) {
    throw new Error("תאריך לא תקין");
  }
  return { fullName: body.fullName, email: body.email.trim().toLowerCase(), city: body.city ?? null, joinedOn: d };
}
