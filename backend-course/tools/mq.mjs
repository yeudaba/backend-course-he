// עוזר לבדיקות של יחידה 26.5: RabbitMQ ו־Kafka שרצים אצלך ב־Docker.
// החיבורים: COURSE_RABBIT_URL ו־COURSE_KAFKA_BROKERS ב־.env (ברירת מחדל localhost:5672 ו־localhost:9092).
// כל בדיקה מקבלת שמות ייחודיים (תורים, exchanges, topics, groups), ומוחקת אותם בסוף —
// כך בדיקות שרצות במקביל לא נוגעות זו בזו.
import { randomBytes } from "node:crypto";
import amqp from "amqplib";
import { Admin, Consumer, Producer, MessagesStreamModes, stringDeserializers, stringSerializers } from "@platformatic/kafka";

export const rabbitUrl = process.env.COURSE_RABBIT_URL || "amqp://localhost:5672";
export const kafkaBrokers = (process.env.COURSE_KAFKA_BROKERS || "localhost:9092").split(",");

const tag = () => `chk.${process.pid}.${randomBytes(3).toString("hex")}`;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- RabbitMQ ----------
export async function rabbitSandbox(t) {
  const base = tag();
  const conns = [];
  const connect = async () => {
    let c;
    try {
      c = await amqp.connect(rabbitUrl);
    } catch (err) {
      throw new Error(`אין חיבור ל־RabbitMQ (${rabbitUrl}): ${err.message}. הרץ את הקונטיינר (יחידה 26.5, קופסת 🧰)`);
    }
    c.on("error", () => {});
    conns.push(c);
    return c;
  };
  const conn = await connect();
  const admin = await conn.createChannel(); // ערוץ של הבודק — לא של הקוד שלך
  admin.on("error", () => {});
  const queues = new Set();
  const exchanges = new Set();
  t.after(async () => {
    const c = await amqp.connect(rabbitUrl);
    const ch = await c.createChannel();
    for (const q of queues) await ch.deleteQueue(q).catch(() => {});
    for (const e of exchanges) await ch.deleteExchange(e).catch(() => {});
    await c.close().catch(() => {});
    for (const x of conns) await x.close().catch(() => {});
  });
  const name = (kind, s) => {
    const n = `${base}.${s}`;
    (kind === "q" ? queues : exchanges).add(n);
    return n;
  };
  return {
    url: rabbitUrl,
    conn,
    admin,
    connect,
    // שם ייחודי לתור / ל־exchange (נמחק בסוף הבדיקה)
    queue: (s) => name("q", s),
    exchange: (s) => name("e", s),
    async channel() {
      const ch = await conn.createChannel();
      ch.on("error", () => {});
      return ch;
    },
    // כמה הודעות מחכות בתור (בלי לצרוך)
    async depth(q) {
      return (await admin.checkQueue(q)).messageCount;
    },
    // שולף את כל ההודעות שמחכות בתור (ומאשר אותן)
    async drain(q) {
      const out = [];
      for (;;) {
        const m = await admin.get(q, { noAck: false });
        if (!m) return out;
        out.push({ body: m.content.toString(), routingKey: m.fields.routingKey, headers: m.properties.headers ?? {}, properties: m.properties });
        admin.ack(m);
      }
    },
  };
}

// מחכה עד שהתנאי מתקיים (או נכשל אחרי timeout)
export async function waitFor(fn, { timeout = 8000, every = 50, message = "התנאי לא התקיים בזמן" } = {}) {
  const end = Date.now() + timeout;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) throw new Error(message);
    await sleep(every);
  }
}

// ---------- Kafka ----------
export async function kafkaSandbox(t, { partitions = 3 } = {}) {
  const base = tag().replace(/\./g, "-");
  const admin = new Admin({ clientId: `${base}-admin`, bootstrapBrokers: kafkaBrokers });
  const topics = [];
  const clients = [];
  t.after(async () => {
    for (const c of clients) await c.close(true).catch(() => {});
    if (topics.length) await admin.deleteTopics({ topics }).catch(() => {});
    await admin.close().catch(() => {});
  });
  const topic = async (s = "events", n = partitions) => {
    const name = `${base}-${s}`;
    try {
      await admin.createTopics({ topics: [name], partitions: n, replicas: 1 });
    } catch (err) {
      throw new Error(`אין חיבור ל־Kafka (${kafkaBrokers.join(",")}): ${err.message}. הרץ את הקונטיינר (יחידה 26.5, קופסת 🧰)`);
    }
    topics.push(name);
    return name;
  };
  let groups = 0;
  return {
    brokers: kafkaBrokers,
    admin,
    topic,
    groupId: () => `${base}-g${++groups}`,
    track(client) {
      clients.push(client);
      return client;
    },
    producer() {
      // idempotent: retry של ה־producer (למשל מול topic שזה עתה נוצר) לא יכתוב את אותה הודעה פעמיים
      const p = new Producer({ clientId: `${base}-p`, bootstrapBrokers: kafkaBrokers, serializers: stringSerializers, idempotent: true });
      clients.push(p);
      return p;
    },
    // קורא n הודעות מתחילת ה־topic (group חדש, בלי commit) — מה הקוד שלך כתב
    async readAll(topicName, n, { timeout = 10000 } = {}) {
      const c = new Consumer({ groupId: `${base}-reader-${++groups}`, clientId: `${base}-r`, bootstrapBrokers: kafkaBrokers, deserializers: stringDeserializers });
      clients.push(c);
      const stream = await c.consume({ topics: [topicName], mode: MessagesStreamModes.EARLIEST, autocommit: false });
      const out = [];
      const timer = setTimeout(() => stream.close().catch(() => {}), timeout);
      try {
        for await (const m of stream) {
          out.push({ key: m.key, value: m.value, partition: m.partition, offset: Number(m.offset), headers: Object.fromEntries([...(m.headers ?? new Map())].map(([k, v]) => [String(k), String(v)])) });
          if (out.length >= n) break;
        }
      } finally {
        clearTimeout(timer);
        await stream.close().catch(() => {});
      }
      return out;
    },
    // ה־offset שה־group עשה לו commit, לכל partition (‎-1 = עוד לא)
    async committed(groupId, topicName) {
      const res = await admin.listConsumerGroupOffsets({ groups: [groupId] });
      const g = res.find?.((x) => x.groupId === groupId) ?? res[0];
      const t = g?.topics?.find((x) => x.name === topicName);
      return Object.fromEntries((t?.partitions ?? []).map((p) => [p.partitionIndex, Number(p.committedOffset)]));
    },
  };
}

// מריץ קוד שלך עם תקרת זמן. נתקע (למשל consumer שמחכה להודעות שלא יגיעו) ← הבדיקה נכשלת עם הסבר,
// והתהליך נסגר — אחרת חיבור פתוח שלך היה משאיר את הבדיקה תלויה לנצח
export async function deadline(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      setTimeout(() => process.exit(1), 300).unref();
      reject(new Error(`${message} (עברו ${ms / 1000} שניות)`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
