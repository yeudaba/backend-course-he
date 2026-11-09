// P24-E27: registry של מדדים בפורמט של Prometheus
type Labels = Record<string, string>;

export function createRegistry() {
  function counter({ name, help, labelNames = [] }: { name: string; help: string; labelNames?: string[] }) {
    return {
      inc(labels: Labels = {}, by = 1) {
        // כתוב כאן
      },
    };
  }

  function histogram({ name, help, labelNames = [], buckets }: { name: string; help: string; labelNames?: string[]; buckets: number[] }) {
    return {
      observe(labels: Labels, value: number) {
        // כתוב כאן
      },
    };
  }

  return { counter, histogram, metrics: () => "" };
}
