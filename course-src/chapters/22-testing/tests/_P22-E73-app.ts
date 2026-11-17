// מודול לבדיקה של P22-E73 (לא משנים). CLOCK ו־NOTES_REPO צריך להחליף בבדיקות:
// ה־repository "האמיתי" מנסה להתחבר למסד ונכשל.
import { Body, Controller, Get, Inject, Module, Post } from "@nestjs/common";

export const CLOCK = "CLOCK";
export const NOTES_REPO = "NOTES_REPO";

export class DbNotesRepository {
  async list(): Promise<string[]> {
    throw new Error("אין חיבור למסד");
  }
  async add(_text: string): Promise<void> {
    throw new Error("אין חיבור למסד");
  }
}

@Controller()
export class AppController {
  constructor(@Inject(CLOCK) private readonly clock: { now(): Date }, @Inject(NOTES_REPO) private readonly notes: DbNotesRepository) {}
  @Get("now")
  now() {
    return { now: this.clock.now().toISOString() };
  }
  @Get("notes")
  list() {
    return this.notes.list();
  }
  @Post("notes")
  async add(@Body() body: { text: string }) {
    await this.notes.add(body.text);
    return { ok: true };
  }
}

@Module({
  controllers: [AppController],
  providers: [
    { provide: CLOCK, useValue: { now: () => new Date() } },
    { provide: NOTES_REPO, useClass: DbNotesRepository },
  ],
})
export class AppModule {}
