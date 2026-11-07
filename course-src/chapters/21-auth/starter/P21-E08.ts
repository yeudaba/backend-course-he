// P21-E08: POST /auth/register — DTO, bcrypt, 409, בלי passwordHash בתשובה
import { Body, ConflictException, Controller, Inject, Injectable, Module, Post } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export const BCRYPT_ROUNDS = "BCRYPT_ROUNDS";

export class RegisterDto {
  // כתוב כאן: email, password
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

  findByEmail(email: string): User | undefined {
    return undefined; // כתוב כאן
  }

  // כתוב כאן register(dto)
}

// כתוב כאן AuthController

@Module({
  controllers: [],
  providers: [UsersService, { provide: BCRYPT_ROUNDS, useValue: 12 }],
})
export class AuthModule {}
