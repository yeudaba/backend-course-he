// P25.5-E93: UUID ל־BINARY(16), ו־UUIDv7 ממוין
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function uuidToBin(uuid: string): Buffer {
  if (!UUID.test(uuid)) throw new RangeError(`UUID לא תקין: ${uuid}`);
  return Buffer.from(uuid.replaceAll("-", ""), "hex");
}

export function binToUuid(bin: Buffer): string {
  const h = bin.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function uuidv7(nowMs: number, random: Buffer): string {
  const b = Buffer.from(random.subarray(0, 16));
  b.writeUIntBE(nowMs, 0, 6); // 48 ביט של זמן — ולכן ממוין לפי זמן
  b[6] = (b[6] & 0x0f) | 0x70; // version 7
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10
  return binToUuid(b);
}

const id = uuidv7(Date.UTC(2026, 10, 7, 12), Buffer.alloc(16, 0xab));
console.log(id, uuidToBin(id).length, binToUuid(uuidToBin(id.toUpperCase())) === id);
