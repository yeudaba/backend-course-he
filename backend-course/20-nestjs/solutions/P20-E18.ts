// P20-E18
import { Body, Controller, Get, Inject, Injectable, Module, Post } from "@nestjs/common";
import { IsString, Length } from "class-validator";

export interface Note {
  id: number;
  text: string;
}

export interface NotesRepository {
  list(): Promise<Note[]>;
  add(text: string): Promise<Note>;
}

export const NOTES_REPOSITORY = "NOTES_REPOSITORY";

export class InMemoryNotesRepository implements NotesRepository {
  private readonly notes: Note[] = [];

  async list() {
    return this.notes;
  }

  async add(text: string) {
    const note = { id: this.notes.length + 1, text };
    this.notes.push(note);
    return note;
  }
}

export class CreateNoteDto {
  @IsString()
  @Length(1, 500)
  text: string;
}

@Injectable()
export class NotesService {
  constructor(@Inject(NOTES_REPOSITORY) private readonly repo: NotesRepository) {}

  list() {
    return this.repo.list();
  }

  add(text: string) {
    return this.repo.add(text.trim());
  }
}

@Controller("notes")
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list() {
    return this.notes.list();
  }

  @Post()
  add(@Body() dto: CreateNoteDto) {
    return this.notes.add(dto.text);
  }
}

@Module({
  controllers: [NotesController],
  providers: [NotesService, { provide: NOTES_REPOSITORY, useClass: InMemoryNotesRepository }],
})
export class NotesModule {}
