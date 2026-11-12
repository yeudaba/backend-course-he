// P20-E50: הרשמה — DTO, 409 ובלי סיסמה בתשובה
import { Body, ConflictException, Controller, Injectable, Module, Post } from "@nestjs/common";
import { IsEmail, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/\d/, { message: "password חייב לכלול ספרה" })
  password: string;

  @IsOptional()
  @IsString()
  @Length(2, 40)
  displayName?: string;
}

type User = { id: number; email: string; displayName: string | null; password: string };

@Injectable()
export class UsersService {
  private users: User[] = [];

  signup(dto: SignupDto) {
    const email = dto.email.toLowerCase();
    if (this.users.some((u) => u.email === email)) throw new ConflictException("האימייל כבר רשום");
    const user: User = { id: this.users.length + 1, email, displayName: dto.displayName ?? null, password: dto.password };
    this.users.push(user);
    const { password, ...pub } = user;
    return pub;
  }
}

@Controller("signup")
export class SignupController {
  constructor(private readonly users: UsersService) {}
  @Post()
  signup(@Body() dto: SignupDto) {
    return this.users.signup(dto);
  }
}

@Module({ controllers: [SignupController], providers: [UsersService] })
export class SignupModule {}
