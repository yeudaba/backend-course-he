// P21-E20: מתוקן
import { Body, Controller, Get, Headers, HttpCode, Injectable, Module, Post, UnauthorizedException } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

export const JWT_SECRET = "e20-secret-for-exercises-only-0123456789";

interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
}

@Injectable()
export class AuthService {
  private readonly users: User[] = [];

  constructor(private readonly jwt: JwtService) {}

  async register(email: string, password: string) {
    const user: User = { id: this.users.length + 1, email, passwordHash: await bcrypt.hash(password, 4), role: "user" };
    this.users.push(user);
    const { passwordHash, ...publicUser } = user; // ← תקלה 3: ה־hash יצא בתשובה
    return publicUser;
  }

  async login(email: string, password: string) {
    const user = this.users.find((u) => u.email === email);
    // ← תקלה 2: היה password === user.passwordHash — סיסמה אף פעם לא שווה ל־hash שלה
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException("אימייל או סיסמה שגויים");
    return { accessToken: await this.jwt.signAsync({ sub: user.id, role: user.role }, { expiresIn: 900 }) };
  }

  async whoAmI(authorization: string | undefined) {
    const token = /^Bearer\s+(\S+)$/i.exec(authorization ?? "")?.[1];
    if (!token) throw new UnauthorizedException("נדרשת התחברות");
    try {
      // ← תקלה 1: היה jwt.decode — מפענח בלי לבדוק חתימה. כל אחד יכול "להיות" admin
      const payload = await this.jwt.verifyAsync<{ sub: number; role: string }>(token);
      return { id: payload.sub, role: payload.role };
    } catch {
      throw new UnauthorizedException("טוקן לא תקין");
    }
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: { email: string; password: string }) {
    return this.auth.register(body.email, body.password);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.auth.whoAmI(authorization);
  }
}

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
