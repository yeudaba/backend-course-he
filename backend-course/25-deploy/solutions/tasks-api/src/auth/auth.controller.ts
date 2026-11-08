import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser, Public, type AuthUser } from "./auth.decorators";
import { loginSchema, refreshSchema, registerSchema, updateMeSchema, type LoginInput, type RegisterInput, type UpdateMeInput } from "./auth.schema";
import { AuthRateLimitGuard } from "./auth-rate-limit.guard";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @UseGuards(AuthRateLimitGuard)
  @Post("register")
  @ApiBody({ schema: z.toJSONSchema(registerSchema, { io: "input" }) as object })
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput) {
    return this.auth.register(body);
  }

  @Public()
  @UseGuards(AuthRateLimitGuard)
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

  @ApiBearerAuth()
  @Patch("me")
  @ApiBody({ schema: z.toJSONSchema(updateMeSchema, { io: "input" }) as object })
  updateMe(@CurrentUser() user: AuthUser, @Body(new ZodValidationPipe(updateMeSchema)) body: UpdateMeInput) {
    return this.auth.updateMe(user.id, body);
  }
}
