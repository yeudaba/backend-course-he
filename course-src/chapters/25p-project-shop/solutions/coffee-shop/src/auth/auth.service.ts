import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { CONFIG, type AppConfig } from "../config";
import { HttpError } from "../errors";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginInput, RegisterInput } from "./auth.schema";

const publicUser = { id: true, email: true, name: true, role: true, createdAt: true } as const;

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger("AuthService");
  // hash קבוע לאימייל שלא קיים — כדי שהזמן יהיה זהה ולא יסגיר מי רשום (פרק 21)
  private dummyHash = "";

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  async onApplicationBootstrap() {
    this.dummyHash = await bcrypt.hash("dummy-password-for-timing", this.config.bcryptRounds);
    const admin = this.config.admin;
    if (!admin) return;
    const passwordHash = await bcrypt.hash(admin.password, this.config.bcryptRounds);
    await this.prisma.user.upsert({
      where: { email: admin.email },
      create: { email: admin.email, passwordHash, name: "מנהל", role: "admin" },
      update: { passwordHash, role: "admin" },
    });
    this.logger.log(`מנהל: ${admin.email}`);
  }

  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, this.config.bcryptRounds);
    try {
      // תמיד customer: role לא מגיע מהלקוח (strictObject דוחה אותו)
      return await this.prisma.user.create({ data: { email: input.email, name: input.name, passwordHash }, select: publicUser });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw new HttpError(409, "EMAIL_TAKEN", "האימייל כבר רשום");
      throw err;
    }
  }

  async login({ email, password }: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? this.dummyHash);
    if (!user || !ok) throw new HttpError(401, "INVALID_CREDENTIALS", "אימייל או סיסמה שגויים");
    const accessToken = await this.jwt.signAsync({ sub: user.id }, { expiresIn: this.config.accessTokenTtlSeconds });
    return { accessToken, expiresIn: this.config.accessTokenTtlSeconds, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  me(id: number) {
    return this.prisma.user.findUniqueOrThrow({ where: { id }, select: publicUser });
  }
}
