// P21-E42: הרשמה בלי כפילויות — גם כשהבקשות מגיעות יחד
import bcrypt from "bcryptjs";

type Stored = { id: number; email: string; passwordHash: string };

export class UsersRegistry {
  private byEmail = new Map<string, Stored>();
  private nextId = 1;
  private readonly rounds: number;

  constructor(rounds: number) {
    this.rounds = rounds;
  }

  async register(email: string, password: string): Promise<{ id: number; email: string }> {
    const normalized = email.trim().toLowerCase();
    if (this.byEmail.has(normalized)) throw new Error("EMAIL_TAKEN"); // חיסכון: לא מחשבים hash סתם
    const passwordHash = await bcrypt.hash(password, this.rounds);
    // מכאן ועד ה־set אין await — שום בקשה אחרת לא יכולה "להיכנס באמצע"
    if (this.byEmail.has(normalized)) throw new Error("EMAIL_TAKEN");
    const user = { id: this.nextId++, email: normalized, passwordHash };
    this.byEmail.set(normalized, user);
    return { id: user.id, email: user.email };
  }

  findByEmail(email: string): Stored | undefined {
    return this.byEmail.get(email.trim().toLowerCase());
  }

  get size(): number {
    return this.byEmail.size;
  }
}
