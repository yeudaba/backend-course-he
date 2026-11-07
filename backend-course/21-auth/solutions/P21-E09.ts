// P21-E09
import { Body, Controller, HttpCode, Injectable, Module, OnModuleInit, Post, UnauthorizedException } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

export const JWT_SECRET = "e09-secret-for-exercises-only-0123456789";

interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
}

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];

  async onModuleInit() {
    this.users = [
      { id: 1, email: "dana@example.com", passwordHash: await bcrypt.hash("dana-password-1", 4), role: "user" },
      { id: 2, email: "admin@example.com", passwordHash: await bcrypt.hash("admin-password-1", 4), role: "admin" },
    ];
  }

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = this.users.findByEmail(String(email).trim().toLowerCase());
    // אותה שגיאה לשני המקרים
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      throw new UnauthorizedException("אימייל או סיסמה שגויים");
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role }, { expiresIn: 900 });
    return { accessToken, tokenType: "Bearer", expiresIn: 900 };
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }
}

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET })],
  controllers: [AuthController],
  providers: [UsersService, AuthService],
})
export class AuthModule {}
