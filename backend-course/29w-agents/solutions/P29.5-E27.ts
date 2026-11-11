// P29.5-E27 — בודק קלט של כלי לפי JSON Schema (חלק קטן)
export type Schema =
  | { type: "string"; enum?: string[] }
  | { type: "number" | "integer"; minimum?: number; maximum?: number }
  | { type: "boolean" }
  | { type: "array"; items: Schema }
  | { type: "object"; properties: Record<string, Schema>; required?: string[] };

export function validate(schema: Schema, value: unknown, path = "input"): string[] {
  switch (schema.type) {
    case "string":
      if (typeof value !== "string") return [`${path}: צריך להיות string`];
      if (schema.enum && !schema.enum.includes(value)) return [`${path}: חייב להיות אחד מ־${schema.enum.join(", ")}`];
      return [];
    case "number":
    case "integer": {
      if (typeof value !== "number" || !Number.isFinite(value)) return [`${path}: צריך להיות number`];
      if (schema.type === "integer" && !Number.isInteger(value)) return [`${path}: צריך להיות מספר שלם`];
      if (schema.minimum !== undefined && value < schema.minimum) return [`${path}: לפחות ${schema.minimum}`];
      if (schema.maximum !== undefined && value > schema.maximum) return [`${path}: לכל היותר ${schema.maximum}`];
      return [];
    }
    case "boolean":
      return typeof value === "boolean" ? [] : [`${path}: צריך להיות boolean`];
    case "array":
      if (!Array.isArray(value)) return [`${path}: צריך להיות array`];
      return value.flatMap((item, i) => validate(schema.items, item, `${path}[${i}]`));
    case "object": {
      if (value === null || typeof value !== "object" || Array.isArray(value)) return [`${path}: צריך להיות object`];
      const obj = value as Record<string, unknown>;
      const errors: string[] = [];
      for (const key of schema.required ?? []) if (!(key in obj)) errors.push(`${path}.${key}: חסר`);
      for (const key of Object.keys(obj)) {
        const sub = schema.properties[key];
        if (!sub) errors.push(`${path}.${key}: שדה לא מוכר`);
        else errors.push(...validate(sub, obj[key], `${path}.${key}`));
      }
      return errors;
    }
  }
}

const createOrder: Schema = {
  type: "object",
  required: ["customerEmail", "items"],
  properties: {
    customerEmail: { type: "string" },
    items: {
      type: "array",
      items: { type: "object", required: ["productId", "qty"], properties: { productId: { type: "integer" }, qty: { type: "integer", minimum: 1, maximum: 10 } } },
    },
    shipping: { type: "string", enum: ["standard", "express"] },
  },
};
console.log(validate(createOrder, { customerEmail: "dana@example.com", items: [{ productId: 3, qty: 2 }] }));
console.log(validate(createOrder, { items: [{ productId: 3, qty: 0 }, { productId: "4", qty: 1.5 }], shipping: "drone", discount: 100 }));
