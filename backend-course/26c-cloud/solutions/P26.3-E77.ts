// P26.3-E77: checksum ל־ConfigMap — שינוי הגדרות ← rollout
import { createHash } from "node:crypto";

export function configChecksum(data: Record<string, string>) {
  const text = Object.keys(data).sort().map((k) => `${k}=${data[k]}\n`).join("");
  return createHash("sha256").update(text).digest("hex");
}

export function withConfigChecksum<T extends object>(deployment: T, data: Record<string, string>): T {
  const copy = structuredClone(deployment) as any;
  copy.spec.template.metadata ??= {};
  copy.spec.template.metadata.annotations ??= {};
  copy.spec.template.metadata.annotations["checksum/config"] = configChecksum(data);
  return copy;
}
