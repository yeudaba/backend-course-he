// P29-E41: מדדי טוקנים ב־/metrics
export function createAiMetrics() {
  const counts = new Map<string, number>();
  const add = (labels: string, n: number) => counts.set(labels, (counts.get(labels) ?? 0) + n);
  return {
    record(model: string, route: string, usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null }) {
      const base = `model="${model}",route="${route}"`;
      add(`${base},kind="input"`, usage.input_tokens);
      add(`${base},kind="output"`, usage.output_tokens);
      add(`${base},kind="cache_read"`, usage.cache_read_input_tokens ?? 0);
    },
    render() {
      const lines = [...counts]
        .filter(([, v]) => v > 0)
        .map(([labels, v]) => `ai_tokens_total{${labels}} ${v}`)
        ;
      return ["# HELP ai_tokens_total Tokens used by AI calls", "# TYPE ai_tokens_total counter", ...lines].join("\n") + "\n";
    },
  };
}
