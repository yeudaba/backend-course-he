import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";
import { HttpError } from "../errors";

// ולידציה עם Zod (אותן סכמות כמו בגרסת ה־Express). שימוש: @Body(new ZodValidationPipe(schema))
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    const part = metadata.type === "param" ? "params" : metadata.type; // "body" | "query" | "params"
    const details = result.error.issues.map((i) => ({
      path: [part, ...(metadata.data ? [metadata.data] : []), ...i.path].join("."),
      message: i.message,
    }));
    throw new HttpError(400, "VALIDATION_ERROR", "קלט לא תקין", details);
  }
}
