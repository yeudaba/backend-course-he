// P26-E25
import type { Redis } from "ioredis";

// token bucket אטומי: הקריאה, החישוב והכתיבה — בסקריפט Lua אחד. Redis מריץ סקריפט בבת אחת,
// בלי שפקודה אחרת תיכנס באמצע: אין מרוץ בין שרתים, ואין round-trip נוסף
const TAKE = `
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])      -- אסימונים לשנייה
local now = tonumber(ARGV[3])       -- מילישניות
local cost = tonumber(ARGV[4])
local state = redis.call("HMGET", KEYS[1], "tokens", "ts")
local tokens = tonumber(state[1]) or capacity
local ts = tonumber(state[2]) or now
tokens = math.min(capacity, tokens + math.max(0, now - ts) / 1000 * rate)
local allowed = 0
if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
end
redis.call("HSET", KEYS[1], "tokens", tostring(tokens), "ts", tostring(now))
redis.call("PEXPIRE", KEYS[1], math.ceil(capacity / rate * 1000) + 1000)
local retry = 0
if allowed == 0 then retry = math.ceil((cost - tokens) / rate) end
return { allowed, math.floor(tokens), retry }
`;

export async function take(redis: Redis, key: string, { capacity, refillPerSecond, now = Date.now(), cost = 1 }: { capacity: number; refillPerSecond: number; now?: number; cost?: number }) {
  const [allowed, remaining, retryAfterSeconds] = (await redis.eval(TAKE, 1, `tb:${key}`, capacity, refillPerSecond, now, cost)) as number[];
  return { allowed: allowed === 1, remaining, retryAfterSeconds };
}
