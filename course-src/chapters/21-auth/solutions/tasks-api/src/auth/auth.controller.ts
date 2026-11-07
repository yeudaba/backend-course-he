import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser, Public, type AuthUser } from "./auth.decorators";
import { loginSchema, refreshSchema, registerSchema, type LoginInput, type RegisterInput } from "./auth.schema";
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

  @Public()
  @Post("refresh")
  @HttpCode(200)
  @ApiBody({ schema: z.toJSONSchema(refreshSchema, { io: "input" }) as object })
  refresh(@Body(new ZodValidationPipe(refreshSchema)) body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }

  @Public()
  @Post("logout")
  @HttpCode(204)
  @ApiBody({ schema: z.toJSONSchema(refreshSchema, { io: "input" }) as object })
  async logout(@Body(new ZodValidationPipe(refreshSchema)) body: { refreshToken: string }) {
    await this.auth.logout(body.refreshToken);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
