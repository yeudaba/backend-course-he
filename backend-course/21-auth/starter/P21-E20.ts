// P21-E20: שלוש תקלות — אי אפשר להתחבר, ההרשמה מחזירה hash, וטוקן מזויף עובר
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
    return user;
  }

  async login(email: string, password: string) {
    const user = this.users.find((u) => u.email === email);
    if (!user || password !== user.passwordHash) throw new UnauthorizedException("אימייל או סיסמה שגויים");
    return { accessToken: await this.jwt.signAsync({ sub: user.id, role: user.role }, { expiresIn: 900 }) };
  }

  async whoAmI(authorization: string | undefined) {
    const token = /^Bearer\s+(\S+)$/i.exec(authorization ?? "")?.[1];
    if (!token) throw new UnauthorizedException("נדרשת התחברות");
    try {
      const payload = this.jwt.decode<{ sub: number; role: string }>(token);
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
