// P25.7-E21
import type { Db } from "mongodb";

interface Customer {
  _id: string;
  name: string;
  email: string;
  city: string;
  createdAt: Date;
}

const EDITABLE = ["name", "city"] as const;

// PATCH /me: הלקוח מעדכן את הפרופיל שלו
export async function updateProfile(db: Db, customerId: string, body: Record<string, unknown>) {
  // תקלה 2: רק שדות מותרים. אחרת { role: "admin" } או { email } נכנסים כמו שהם (mass assignment)
  const $set: Record<string, string> = {};
  for (const k of EDITABLE) if (typeof body[k] === "string") $set[k] = (body[k] as string).trim();
  if (Object.keys($set).length === 0) throw new RangeError("אין מה לעדכן");
  // תקלה 1: $set ולא replaceOne — replaceOne מחליף את כל המסמך, והאימייל ותאריך ההרשמה נמחקים
  // תקלה 3: await — אחרת מחזירים לפני שהעדכון קרה, ושגיאה הולכת לאיבוד
  const doc = await db.collection<Customer>("customers").findOneAndUpdate({ _id: customerId }, { $set }, { returnDocument: "after" });
  return doc;
}
