// P29-E65: הגדרות כלים בטוחות
import type Anthropic from "@anthropic-ai/sdk";

type ParamType = "string" | "integer" | "number" | "boolean";
const TYPES = new Set(["string", "integer", "number", "boolean"]);

export function defineTools(specs: { name: string; description: string; params: Record<string, ParamType> }[]): Anthropic.Tool[] {
  const seen = new Set<string>();
  return specs.map((s) => {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(s.name)) throw new Error(`שם כלי לא חוקי: ${s.name}`);
    if (seen.has(s.name)) throw new Error(`שם כלי כפול: ${s.name}`);
    seen.add(s.name);

    const properties: Record<string, { type: ParamType }> = {};
    for (const [param, type] of Object.entries(s.params)) {
      if (/^(user|customer|owner)_?id$/i.test(param)) throw new Error(`${s.name}.${param}: המשתמש מגיע מהקוד (JWT), לא מהמודל`);
      if (!TYPES.has(type)) throw new Error(`${s.name}.${param}: טיפוס לא מוכר ${type}`);
      properties[param] = { type };
    }
    return {
      name: s.name,
      description: s.description,
      strict: true,
      input_schema: { type: "object" as const, properties, required: Object.keys(properties), additionalProperties: false },
    };
  });
}
