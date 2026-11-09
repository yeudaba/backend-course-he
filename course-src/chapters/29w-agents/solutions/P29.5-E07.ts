// P29.5-E07: כלי עם סכמה אחת — להגדרה (JSON Schema strict) ולאימות הקלט בפועל
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";

export interface DefinedTool<T> {
  definition: Anthropic.Tool;
  execute: (input: unknown) => Promise<{ content: string; is_error?: true }>;
}

export function defineTool<T extends z.ZodObject<any>>({ name, description, schema, run }: { name: string; description: string; schema: T; run: (input: z.infer<T>) => Promise<string> }): DefinedTool<z.infer<T>> {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) throw new Error(`שם כלי לא תקין: ${name}`);
  const json = z.toJSONSchema(schema.strict()) as Record<string, unknown>; // strict ← additionalProperties: false
  delete json.$schema;
  return {
    definition: { name, description, input_schema: json as Anthropic.Tool.InputSchema, strict: true },
    async execute(input) {
      const parsed = schema.strict().safeParse(input);
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
        return { content: `קלט לא תקין — ${msg}`, is_error: true };
      }
      try {
        return { content: await run(parsed.data) };
      } catch (err) {
        return { content: `שגיאה: ${(err as Error).message}`, is_error: true };
      }
    },
  };
}
