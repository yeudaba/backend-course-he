// P26.5-E83: להחזיר group אחורה (replay)
import type { Admin } from "@platformatic/kafka";

export async function rewindGroup(admin: Admin, groupId: string, topic: string, offsets: Record<number, number>) {
  const entries = Object.entries(offsets).map(([p, o]) => ({ partition: Number(p), offset: o }));
  for (const e of entries) {
    if (!Number.isInteger(e.partition) || e.partition < 0) throw new RangeError(`partition לא תקין: ${e.partition}`);
    if (!Number.isInteger(e.offset) || e.offset < 0) throw new RangeError(`offset לא תקין: ${e.offset}`);
  }
  if (entries.length === 0) return;
  await admin.alterConsumerGroupOffsets({
    groupId,
    topics: [{ name: topic, partitionOffsets: entries.map((e) => ({ partition: e.partition, offset: BigInt(e.offset) })) }],
  });
}
