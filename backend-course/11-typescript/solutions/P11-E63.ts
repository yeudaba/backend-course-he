// P11-E63: התראות
export type Notice =
  | { kind: "email"; to: string; subject: string }
  | { kind: "sms"; phone: string; text: string }
  | { kind: "push"; deviceId: string; title: string };

function assertNever(x: never): never {
  throw new Error(`סוג לא מוכר: ${JSON.stringify(x)}`);
}

export function describe(n: Notice): string {
  switch (n.kind) {
    case "email":
      return `אימייל ל־${n.to}: ${n.subject}`;
    case "sms":
      return `SMS ל־${n.phone}: ${n.text}`;
    case "push":
      return `push ל־${n.deviceId}: ${n.title}`;
    default:
      return assertNever(n);
  }
}

export function cost(n: Notice): number {
  switch (n.kind) {
    case "email":
    case "push":
      return 0;
    case "sms": {
      const parts = Math.max(1, Math.ceil(n.text.length / 70));
      return Math.round(parts * 0.05 * 100) / 100;
    }
    default:
      return assertNever(n);
  }
}

const notices: Notice[] = [
  { kind: "email", to: "dana@x.com", subject: "ההזמנה נשלחה" },
  { kind: "sms", phone: "050-1234567", text: "x".repeat(150) },
];
for (const n of notices) console.log(describe(n).slice(0, 40), cost(n));
