// P26-E30
// כמה שרתים, לקוחות מחוברים לכל אחד: אירוע שקרה בשרת אחד צריך להגיע ללקוחות של כולם — דרך Redis pub/sub
import type { Redis } from "ioredis";

export async function createRelay({ pub, sub, channel }: { pub: Redis; sub: Redis; channel: string }) {
  const listeners = new Set<(data: unknown) => void>();
  // מנוי אחד לשרת, לא אחד לכל לקוח. החיבור sub נפרד: חיבור במצב SUBSCRIBE לא מריץ פקודות אחרות
  await sub.subscribe(channel);
  const onMessage = (ch: string, message: string) => {
    if (ch !== channel) return; // אותו חיבור יכול להיות מנוי לערוצים אחרים
    const data = JSON.parse(message);
    for (const l of listeners) l(data);
  };
  sub.on("message", onMessage);

  return {
    // לא שולחים ישירות למאזינים המקומיים: ההודעה תחזור מ־Redis גם לשרת הזה — אחרת כל אחד יקבל פעמיים
    publish: async (data: unknown) => { await pub.publish(channel, JSON.stringify(data)); },
    subscribe(listener: (data: unknown) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async close() {
      sub.off("message", onMessage);
      await sub.unsubscribe(channel);
    },
  };
}
