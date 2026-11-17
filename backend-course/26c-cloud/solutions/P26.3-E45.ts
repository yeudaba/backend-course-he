// P26.3-E45: מ־compose.yaml לתוכנית AWS
import YAML from "yaml";

type Target = "RDS" | "ElastiCache" | "EKS Job" | "EKS Deployment";
type Service = { image?: string; depends_on?: string[] | Record<string, { condition?: string }> };

export function awsPlanFromCompose(yamlText: string) {
  const services: Record<string, Service> = YAML.parse(yamlText)?.services ?? {};
  const runOnce = new Set<string>();
  for (const s of Object.values(services)) {
    const deps = s.depends_on;
    if (deps && !Array.isArray(deps)) {
      for (const [name, d] of Object.entries(deps)) if (d?.condition === "service_completed_successfully") runOnce.add(name);
    }
  }
  return Object.entries(services)
    .map(([service, s]): { service: string; target: Target } => {
      const image = s.image ?? "";
      if (/^(postgres|mysql)\b/.test(image)) return { service, target: "RDS" };
      if (/^(redis|valkey)\b/.test(image)) return { service, target: "ElastiCache" };
      if (runOnce.has(service)) return { service, target: "EKS Job" };
      return { service, target: "EKS Deployment" };
    })
    .sort((a, b) => (a.service < b.service ? -1 : 1));
}
