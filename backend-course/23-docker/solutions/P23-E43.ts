// P23-E43: לפרק את עמודת PORTS של docker ps
export type PortMap = { hostIp: string; hostPort: number; containerPort: number; protocol: "tcp" | "udp" };

const RE = /^(\[[^\]]+\]|[\d.]+):(\d+)->(\d+)\/(tcp|udp)$/;

export function parsePorts(text: string): PortMap[] {
  if (text.trim() === "") return [];
  const out: PortMap[] = [];
  for (const item of text.split(",").map((s) => s.trim())) {
    if (!item.includes("->")) {
      if (/^\d+\/(tcp|udp)$/.test(item)) continue;
      throw new Error(`לא מובן: ${item}`);
    }
    const m = RE.exec(item);
    if (!m) throw new Error(`לא מובן: ${item}`);
    out.push({ hostIp: m[1].replace(/^\[|\]$/g, ""), hostPort: Number(m[2]), containerPort: Number(m[3]), protocol: m[4] as "tcp" | "udp" });
  }
  return out;
}
