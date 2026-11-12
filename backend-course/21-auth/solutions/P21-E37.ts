// P21-E37: PasswordService — hash, verify, ו־verifyAgainstDummy באותו זמן
import bcrypt from "bcryptjs";

export class PasswordService {
  private readonly rounds: number;
  private dummy?: Promise<string>;

  constructor(rounds: number) {
    this.rounds = rounds;
  }

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async verifyAgainstDummy(password: string): Promise<false> {
    this.dummy ??= bcrypt.hash("dummy-password-not-a-real-user", this.rounds);
    await bcrypt.compare(password, await this.dummy);
    return false;
  }
}
