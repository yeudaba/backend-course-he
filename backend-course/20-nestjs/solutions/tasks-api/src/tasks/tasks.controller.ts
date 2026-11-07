import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import {
  createTaskSchema,
  idParamsSchema,
  listQuerySchema,
  updateTaskSchema,
  type CreateTaskInput,
  type ListQuery,
  type UpdateTaskInput,
} from "./tasks.schema";
import { TasksService } from "./tasks.service";

const idPipe = new ZodValidationPipe(idParamsSchema.shape.id);

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: "רשימה: status, priority, q, sort, page, limit" })
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    return this.tasks.list(query);
  }

  // לפני :id — אחרת "stats" היה נתפס כ־id
  @Get("stats")
  stats() {
    return this.tasks.stats();
  }

  @Get(":id")
  get(@Param("id", idPipe) id: number) {
    return this.tasks.get(id);
  }

  @Post()
  @ApiBody({ schema: z.toJSONSchema(createTaskSchema, { io: "input" }) as object })
  async create(@Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskInput, @Res({ passthrough: true }) res: Response) {
    const task = await this.tasks.create(body);
    res.location(`/tasks/${task.id}`);
    return task;
  }

  @Patch(":id")
  @ApiBody({ schema: z.toJSONSchema(updateTaskSchema, { io: "input" }) as object })
  update(@Param("id", idPipe) id: number, @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskInput) {
    return this.tasks.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id", idPipe) id: number) {
    await this.tasks.remove(id);
  }
}
