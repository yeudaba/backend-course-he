// P12-E48: שולח התראות — הרכבה ושגיאה עם cause
export type Sender = { send(phone: string, text: string): void };

export class NotifyError extends Error {
  readonly sent: number;
  constructor(message: string, sent: number, cause: unknown) {
    super(message, { cause });
    this.name = new.target.name;
    this.sent = sent;
  }
}

export class Notifier {
  #sender: Sender;

  constructor(sender: Sender) {
    this.#sender = sender;
  }

  notifyAll(users: { name: string; phone?: string }[], text: string): number {
    let sent = 0;
    for (const u of users) {
      if (!u.phone) continue;
      try {
        this.#sender.send(u.phone, text);
      } catch (err) {
        throw new NotifyError(`השליחה ל־${u.name} נכשלה`, sent, err);
      }
      sent++;
    }
    return sent;
  }
}

const log: string[] = [];
const fake: Sender = {
  send(phone, text) {
    if (phone === "000") throw new Error("מספר חסום");
    log.push(`${phone}: ${text}`);
  },
};
const n = new Notifier(fake);
console.log(n.notifyAll([{ name: "דנה", phone: "050" }, { name: "עומר" }], "שלום"), log);
try {
  n.notifyAll([{ name: "נועה", phone: "052" }, { name: "רון", phone: "000" }], "היי");
} catch (err) {
  if (err instanceof NotifyError) console.log(String(err), err.sent, String(err.cause));
}
