import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { type AuthUser, CurrentUser, Public } from "./auth.decorators";
import { type LoginInput, loginSchema, type RegisterInput, registerSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @ApiBody({ schema: z.toJSONSchema(registerSchema, { io: "input" }) as object })
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput) {
    return this.auth.register(body);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiBody({ schema: z.toJSONSchema(loginSchema, { io: "input" }) as object })
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.auth.login(body);
  }

  @Get("me")
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
