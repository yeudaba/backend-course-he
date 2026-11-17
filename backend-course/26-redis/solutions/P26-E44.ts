// P26-E44: פרופיל — Zod לפני HSET, וטיפוסים בחזרה
import type { Redis } from "ioredis";
import { z } from "zod";

const schema = z.strictObject({
  name: z.string().trim().min(1),
  city: z.string().trim().min(1),
  age: z.number().int().min(13).max(120),
  newsletter: z.boolean().default(false),
});
type Profile = z.infer<typeof schema>;

export async function saveProfile(redis: Redis, userId: number, input: unknown): Promise<Profile> {
  const r = schema.safeParse(input);
  if (!r.success) throw new Error("VALIDATION_ERROR");
  const p = r.data;
  await redis.hset(`profile:${userId}`, { name: p.name, city: p.city, age: String(p.age), newsletter: p.newsletter ? "1" : "0" });
  return p;
}

export async function loadProfile(redis: Redis, userId: number): Promise<Profile | null> {
  const h = await redis.hgetall(`profile:${userId}`);
  if (Object.keys(h).length === 0) return null;
  return { name: h.name, city: h.city, age: Number(h.age), newsletter: h.newsletter === "1" };
}
