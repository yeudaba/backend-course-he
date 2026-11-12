// P24-E115: לקרוא את /metrics
export type Sample = { name: string; labels: Record<string, string>; value: number };

function parseValue(s: string | undefined): number {
  if (s === "+Inf") return Infinity;
  if (s === "-Inf") return -Infinity;
  if (s === "NaN") return NaN;
  if (s === undefined || !/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) throw new Error(`ערך לא תקין: ${s}`);
  return Number(s);
}

function parseLine(line: string): Sample {
  const m = /^([a-zA-Z_:][a-zA-Z0-9_:]*)/.exec(line);
  if (!m) throw new Error("שם לא תקין");
  const name = m[1];
  let i = name.length;
  const labels: Record<string, string> = {};
  if (line[i] === "{") {
    i++;
    while (line[i] !== "}") {
      const lm = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)="/.exec(line.slice(i));
      if (!lm) throw new Error("label לא תקין");
      i += lm[0].length;
      let value = "";
      while (line[i] !== '"') {
        if (i >= line.length) throw new Error("מרכאות לא נסגרו");
        if (line[i] === "\\") {
          const next = line[i + 1];
          value += next === "n" ? "\n" : next;
          i += 2;
        } else value += line[i++];
      }
      labels[lm[1]] = value;
      i++; // המרכאה הסוגרת
      if (line[i] === ",") i++;
      else if (line[i] !== "}") throw new Error("חסר , או }");
    }
    i++; // ה־}
  }
  const [value] = line.slice(i).trim().split(/\s+/);
  return { name, labels, value: parseValue(value) };
}

export function parseMetrics(text: string): Sample[] {
  const samples: Sample[] = [];
  text.split("\n").forEach((raw, idx) => {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) return;
    try {
      samples.push(parseLine(line));
    } catch (err) {
      throw new SyntaxError(`שורה ${idx + 1}: ${(err as Error).message}`);
    }
  });
  return samples;
}

export function total(samples: Sample[], name: string, match: Record<string, string> = {}): number {
  return samples
    .filter((s) => s.name === name && Object.entries(match).every(([k, v]) => s.labels[k] === v))
    .reduce((sum, s) => sum + s.value, 0);
}

const text = `# TYPE http_requests_total counter
http_requests_total{method="GET",route="/tasks/:id",status="200"} 2
http_requests_total{method="POST",route="/tasks",status="201"} 1
http_requests_total{method="GET",route="/tasks/:id",status="404"} 3 1731000000000`;
const s = parseMetrics(text);
console.log(s.length, total(s, "http_requests_total"), total(s, "http_requests_total", { method: "GET" }));
