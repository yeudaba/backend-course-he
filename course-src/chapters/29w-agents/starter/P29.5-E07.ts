// P29.5-E07: כלי עם סכמה אחת — להגדרה (JSON Schema strict) ולאימות הקלט בפועל
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";

export interface DefinedTool<T> {
  definition: Anthropic.Tool;
  execute: (input: unknown) => Promise<{ content: string; is_error?: true }>;
}

export function defineTool<T extends z.ZodObject<any>>({ name, description, schema, run }: { name: string; description: string; schema: T; run: (input: z.infer<T>) => Promise<string> }): DefinedTool<z.infer<T>> {
  throw new Error("עוד לא כתבת את הפתרון");
}
