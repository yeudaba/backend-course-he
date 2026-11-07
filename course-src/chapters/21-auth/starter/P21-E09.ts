// P21-E09: POST /auth/login ← { accessToken, tokenType, expiresIn }
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

  // משתמשים לדוגמה (cost 4 — בשביל מהירות בתרגיל)
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

// כתוב כאן AuthService ו־AuthController

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET })],
  controllers: [],
  providers: [UsersService],
})
export class AuthModule {}
