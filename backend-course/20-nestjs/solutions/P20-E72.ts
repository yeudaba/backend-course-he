// P20-E72: configureApp — prefix, pipe ו־filter
import { ArgumentsHost, Body, Catch, Controller, ExceptionFilter, Get, HttpException, INestApplication, Module, NotFoundException, Param, ParseIntPipe, Post, ValidationPipe } from "@nestjs/common";
import { IsString, Length } from "class-validator";
import type { Response } from "express";

export class CreateNoteDto {
  @IsString()
  @Length(1, 200)
  text: string;
}

@Controller("notes")
export class NotesController {
  private notes: { id: number; text: string }[] = [];

  @Post()
  create(@Body() dto: CreateNoteDto) {
    const note = { id: this.notes.length + 1, text: dto.text };
    this.notes.push(note);
    return note;
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    const note = this.notes.find((n) => n.id === id);
    if (!note) throw new NotFoundException(`פתק ${id} לא נמצא`);
    return note;
  }
}

@Module({ controllers: [NotesController] })
export class NotesModule {}

const CODES: Record<number, string> = { 400: "BAD_REQUEST", 404: "NOT_FOUND" };

@Catch(HttpException)
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const msg = typeof body === "object" && body !== null ? (body as { message?: unknown }).message : body;
    const error = Array.isArray(msg)
      ? { code: CODES[status] ?? "ERROR", message: "Validation failed", details: msg }
      : { code: CODES[status] ?? "ERROR", message: exception.message };
    res.status(status).json({ error });
  }
}

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new ApiErrorFilter());
}
