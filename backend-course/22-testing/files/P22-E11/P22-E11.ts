// P22-E11 — הקוד שבודקים (לא משנים אותו)
export interface Mailer {
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface User {
  id: number;
  email: string;
  wantsEmails: boolean;
}

// שולח לכל משתמש שרוצה מיילים ויש לו משימות באיחור — מייל אחד. מחזיר כמה מיילים נשלחו
export async function notifyOverdue(users: User[], overdueByUser: Map<number, string[]>, mailer: Mailer): Promise<number> {
  let sent = 0;
  for (const user of users) {
    const titles = overdueByUser.get(user.id) ?? [];
    if (!user.wantsEmails || titles.length === 0) continue;
    await mailer.send(user.email, `יש לך ${titles.length} משימות באיחור`, titles.join("\n"));
    sent++;
  }
  return sent;
}
