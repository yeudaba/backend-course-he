// P21-E14: כל משתמש רואה ומשנה רק את הפתקים שלו. ?all=true — רק ל־admin
import {
  Body, CanActivate, Controller, Delete, ExecutionContext, ForbiddenException, Get, HttpCode, Injectable, Module,
  NotFoundException, Param, ParseIntPipe, Patch, Query, Req, UnauthorizedException,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

interface AuthUser {
  id: number;
  role: "user" | "admin";
}

// מדמה התחברות בשביל התרגיל (במקום JWT): x-user-id ו־x-user-role ב־headers
@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const id = Number(req.get("x-user-id"));
    if (!Number.isInteger(id) || id < 1) throw new UnauthorizedException("נדרשת התחברות");
    req.user = { id, role: req.get("x-user-role") ?? "user" };
    return true;
  }
}

export interface Note {
  id: number;
  ownerId: number;
  text: string;
}

@Injectable()
export class NotesService {
  private readonly notes: Note[] = [
    { id: 1, ownerId: 1, text: "הפתק של דנה" },
    { id: 2, ownerId: 2, text: "הפתק של יוסי" },
    { id: 3, ownerId: 1, text: "עוד פתק של דנה" },
  ];

  list(user: AuthUser, all: boolean) {
    return this.notes; // כתוב כאן
  }

  get(user: AuthUser, id: number) {
    return this.notes.find((n) => n.id === id); // כתוב כאן
  }

  update(user: AuthUser, id: number, text: string) {
    const note = this.notes.find((n) => n.id === id)!; // כתוב כאן
    note.text = text;
    return note;
  }

  remove(user: AuthUser, id: number) {
    // כתוב כאן
  }
}

@Controller("notes")
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(@Req() req: { user: AuthUser }, @Query("all") all?: string) {
    return this.notes.list(req.user, all === "true");
  }

  @Get(":id")
  get(@Req() req: { user: AuthUser }, @Param("id", ParseIntPipe) id: number) {
    return this.notes.get(req.user, id);
  }

  @Patch(":id")
  update(@Req() req: { user: AuthUser }, @Param("id", ParseIntPipe) id: number, @Body() body: { text: string }) {
    return this.notes.update(req.user, id, String(body.text));
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Req() req: { user: AuthUser }, @Param("id", ParseIntPipe) id: number) {
    this.notes.remove(req.user, id);
  }
}

@Module({
  controllers: [NotesController],
  providers: [NotesService, { provide: APP_GUARD, useClass: FakeAuthGuard }],
})
export class NotesModule {}
