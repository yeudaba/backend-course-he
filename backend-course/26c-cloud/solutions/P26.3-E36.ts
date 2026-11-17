// P26.3-E36: EC2 או Lambda — מה יותר זול?
const cents = (x: number) => Math.round(x * 100) / 100;

export function ec2Monthly(hourlyUsd: number, instances: number, hours = 730) {
  return cents(hourlyUsd * instances * hours);
}

export function lambdaMonthly({ requests, avgMs, memoryMb, perMillionRequests = 0.2, perGbSecond = 0.0000166667 }: { requests: number; avgMs: number; memoryMb: number; perMillionRequests?: number; perGbSecond?: number }) {
  const requestCost = (requests / 1_000_000) * perMillionRequests;
  const gbSeconds = requests * (avgMs / 1000) * (memoryMb / 1024);
  return cents(requestCost + gbSeconds * perGbSecond);
}

export function cheaper(ec2: number, lambda: number): "ec2" | "lambda" | "same" {
  return ec2 < lambda ? "ec2" : lambda < ec2 ? "lambda" : "same";
}
