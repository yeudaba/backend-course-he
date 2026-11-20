// P29-E35: ההגדרות של הלקוח
const MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"];

export function aiConfig(env: Record<string, string | undefined>) {
  const apiKey = env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey.startsWith("sk-ant-")) throw new Error("ANTHROPIC_API_KEY חסר או לא בפורמט הנכון (sk-ant-...)");
  const model = env.AI_MODEL || "claude-opus-5-5";
  if (!MODELS.includes(model)) throw new Error(`AI_MODEL לא מוכר: ${model}`);
  const intIn = (name: string, def: number, min: number, max: number) => {
    const raw = env[name];
    if (raw === undefined || raw === "") return def;
    if (!/^\d+$/.test(raw) || Number(raw) < min || Number(raw) >= max) throw new Error(`${name} חייב להיות שלם בין ${min} ל־${max}`);
    return Number(raw);
  };
  return { apiKey, model, maxRetries: intIn("AI_MAX_RETRIES", 2, 0, 5), timeoutMs: intIn("AI_TIMEOUT_MS", 30_000, 1_000, 600_000) };
}
