import { Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { CONFIG, type AppConfig } from "../config";

@Injectable()
export class PasswordService {
  // hash של סיסמה שאף אחד לא יודע — כדי ש"משתמש לא קיים" ייקח בדיוק כמו "סיסמה שגויה" (שיעור 1)
  private dummyHash?: Promise<string>;

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  hash(password: string) {
    return bcrypt.hash(password, this.config.bcryptRounds);
  }

  verify(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async verifyAgainstDummy(password: string) {
    this.dummyHash ??= bcrypt.hash("dummy-password-nobody-knows", this.config.bcryptRounds);
    await bcrypt.compare(password, await this.dummyHash);
    return false;
  }
}
