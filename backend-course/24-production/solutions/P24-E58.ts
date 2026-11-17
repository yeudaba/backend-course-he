// P24-E58: zod — פרופיל עם אזור, יום הולדת ושעת תזכורת
import { z } from "zod";

function isValidTimeZone(tz: string): boolean {
  if (tz === "") return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const profileSchema = z.strictObject({
  timeZone: z.string().refine(isValidTimeZone, "אזור זמן לא מוכר"),
  birthDate: z.iso.date().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "שעה בפורמט HH:mm").optional(),
});

console.log(profileSchema.parse({ timeZone: "Asia/Jerusalem", birthDate: "1990-05-17", reminderTime: "08:30" }));
console.log(profileSchema.safeParse({ timeZone: "Mars/Olympus" }).error?.issues[0].message);
