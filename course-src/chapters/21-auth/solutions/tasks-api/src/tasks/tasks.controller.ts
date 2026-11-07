import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { z } from "zod";
import { CurrentUser, type AuthUser } from "../auth/auth.decorators";
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

// כל ה־routes כאן מוגנים (ה־guard הגלובלי), וכל אחד עובד רק על המשימות של user.id
@ApiTags("tasks")
@ApiBearerAuth()
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: "רשימה: status, priority, q, sort, page, limit" })
  list(@CurrentUser() user: AuthUser, @Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    return this.tasks.list(user.id, query);
  }

  // לפני :id — אחרת "stats" היה נתפס כ־id
  @Get("stats")
  stats(@CurrentUser() user: AuthUser) {
    return this.tasks.stats(user.id);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthUser, @Param("id", idPipe) id: number) {
    return this.tasks.get(user.id, id);
  }

  @Post()
  @ApiBody({ schema: z.toJSONSchema(createTaskSchema, { io: "input" }) as object })
  async create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const task = await this.tasks.create(user.id, body);
    res.location(`/tasks/${task.id}`);
    return task;
  }

  @Patch(":id")
  @ApiBody({ schema: z.toJSONSchema(updateTaskSchema, { io: "input" }) as object })
  update(@CurrentUser() user: AuthUser, @Param("id", idPipe) id: number, @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskInput) {
    return this.tasks.update(user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param("id", idPipe) id: number) {
    await this.tasks.remove(user.id, id);
  }
}
