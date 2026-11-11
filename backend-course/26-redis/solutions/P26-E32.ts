// P26-E32 — לקרוא את INFO של Redis
export type Info = Record<string, Record<string, string>>;

export function parseInfo(text: string): Info {
  const info: Info = {};
  let section: Record<string, string> | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    if (line.startsWith("#")) {
      section = {};
      info[line.slice(1).trim().toLowerCase()] = section;
      continue;
    }
    const colon = line.indexOf(":");
    if (colon === -1 || section === undefined) continue;
    section[line.slice(0, colon)] = line.slice(colon + 1);
  }
  return info;
}

export function parseKeyspace(info: Info): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const [db, value] of Object.entries(info.keyspace ?? {})) {
    result[db] = Object.fromEntries(
      value.split(",").map((pair) => {
        const [key, n] = pair.split("=");
        return [key, Number(n)];
      }),
    );
  }
  return result;
}

export function hitRatio(info: Info): number | null {
  const hits = Number(info.stats?.keyspace_hits ?? 0);
  const misses = Number(info.stats?.keyspace_misses ?? 0);
  if (hits + misses === 0) return null;
  return Math.round((hits / (hits + misses)) * 1000) / 1000;
}

const sample = [
  "# Server",
  "redis_version:8.2.1",
  "os:Linux 6.10.14-linuxkit aarch64",
  "listener0:name=tcp,bind=*,port=6379",
  "",
  "# Stats",
  "keyspace_hits:1520",
  "keyspace_misses:480",
  "",
  "# Keyspace",
  "db0:keys=1204,expires=980,avg_ttl=512331,subexpiry=0",
  "db3:keys=7,expires=0,avg_ttl=0,subexpiry=0",
].join("\r\n");
const info = parseInfo(sample);
console.log(info.server);
console.log(parseKeyspace(info));
console.log(hitRatio(info), hitRatio(parseInfo("# Stats\r\nkeyspace_hits:0\r\nkeyspace_misses:0")));
