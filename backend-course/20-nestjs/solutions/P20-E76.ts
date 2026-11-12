// P20-E76: ZodValidationPipe עם נתיבים
import { ArgumentMetadata, BadRequestException, Body, Controller, Get, Module, Param, PipeTransform, Post, Query } from "@nestjs/common";
import { z } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const r = this.schema.safeParse(value);
    if (r.success) return r.data;
    const type = metadata.type === "param" ? "params" : metadata.type;
    const details = r.error.issues.map((issue) => ({
      path: [type, ...(metadata.data ? [metadata.data] : []), ...issue.path.map(String)].join("."),
      message: issue.message,
    }));
    throw new BadRequestException({ error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } });
  }
}

const CreateTask = z.object({
  title: z.string().trim().min(1).max(100),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});
const Id = z.coerce.number().int().positive();
const ListQuery = z.object({ page: z.coerce.number().int().min(1).default(1) });

@Controller("tasks")
export class TasksController {
  @Post()
  create(@Body(new ZodValidationPipe(CreateTask)) body: z.infer<typeof CreateTask>) {
    return body;
  }

  @Get(":id")
  findOne(@Param("id", new ZodValidationPipe(Id)) id: number) {
    return { id };
  }

  @Get()
  list(@Query(new ZodValidationPipe(ListQuery)) query: z.infer<typeof ListQuery>) {
    return query;
  }
}

@Module({ controllers: [TasksController] })
export class TasksModule {}
