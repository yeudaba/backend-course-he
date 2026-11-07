// P21-E08
import { Body, ConflictException, Controller, Inject, Injectable, Module, Post } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export const BCRYPT_ROUNDS = "BCRYPT_ROUNDS";

export class RegisterDto {
  // רץ לפני הבדיקה (transform: true): "  Dana@Example.com " ← "dana@example.com"
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  constructor(@Inject(BCRYPT_ROUNDS) private readonly rounds: number) {}

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  async register(dto: RegisterDto) {
    const email = dto.email;
    if (this.findByEmail(email)) throw new ConflictException("האימייל כבר רשום");
    const user: User = { id: this.users.length + 1, email, passwordHash: await bcrypt.hash(dto.password, this.rounds), role: "user" };
    this.users.push(user);
    const { passwordHash, ...publicUser } = user; // hash לא יוצא החוצה
    return publicUser;
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly users: UsersService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.users.register(dto);
  }
}

@Module({
  controllers: [AuthController],
  providers: [UsersService, { provide: BCRYPT_ROUNDS, useValue: 12 }],
})
export class AuthModule {}
