// P21-E22: שלוש פרצות IDOR — מחיקה, רשימה ועדכון
import {
  Body, CanActivate, Controller, Delete, ExecutionContext, Get, HttpCode, Injectable, Module, NotFoundException, Param,
  ParseIntPipe, Patch, Query, Req, UnauthorizedException,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { IsInt, IsOptional, IsString, Length } from "class-validator";

interface AuthUser {
  id: number;
}

// מדמה התחברות בשביל התרגיל (במקום JWT): x-user-id ב־header
@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const id = Number(req.get("x-user-id"));
    if (!Number.isInteger(id) || id < 1) throw new UnauthorizedException("נדרשת התחברות");
    req.user = { id };
    return true;
  }
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  text?: string;

  @IsOptional()
  @IsInt()
  ownerId?: number;
}

interface Note {
  id: number;
  ownerId: number;
  text: string;
}

@Injectable()
export class NotesService {
  private readonly notes: Note[] = [
    { id: 1, ownerId: 1, text: "הפתק של דנה" },
    { id: 2, ownerId: 2, text: "הפתק של יוסי" },
  ];

  private findOwn(userId: number, id: number) {
    const note = this.notes.find((n) => n.id === id && n.ownerId === userId);
    if (!note) throw new NotFoundException(`פתק ${id} לא נמצא`);
    return note;
  }

  list(ownerId: number) {
    return this.notes.filter((n) => n.ownerId === ownerId);
  }

  update(userId: number, id: number, dto: UpdateNoteDto) {
    const note = this.findOwn(userId, id);
    Object.assign(note, dto);
    return note;
  }

  remove(userId: number, id: number) {
    const note = this.notes.find((n) => n.id === id);
    if (!note) throw new NotFoundException(`פתק ${id} לא נמצא`);
    this.notes.splice(this.notes.indexOf(note), 1);
  }
}

@Controller("notes")
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(@Req() req: { user: AuthUser }, @Query("ownerId") ownerId?: string) {
    return this.notes.list(ownerId ? Number(ownerId) : req.user.id);
  }

  @Patch(":id")
  update(@Req() req: { user: AuthUser }, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateNoteDto) {
    return this.notes.update(req.user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Req() req: { user: AuthUser }, @Param("id", ParseIntPipe) id: number) {
    this.notes.remove(req.user.id, id);
  }
}

@Module({
  controllers: [NotesController],
  providers: [NotesService, { provide: APP_GUARD, useClass: FakeAuthGuard }],
})
export class NotesModule {}
