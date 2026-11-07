import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { CONFIG, type AppConfig } from "../config";
import { UsersController } from "../users/users.controller";
import { PrismaUsersRepository } from "../users/users.prisma-repository";
import { USERS_REPOSITORY } from "../users/users.repository";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PasswordService } from "./password.service";
import { PrismaRefreshTokensRepository } from "./refresh-tokens.prisma-repository";
import { REFRESH_TOKENS_REPOSITORY } from "./refresh-tokens.repository";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [CONFIG],
      useFactory: (config: AppConfig) => ({ secret: config.jwtSecret }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    PasswordService,
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
    { provide: REFRESH_TOKENS_REPOSITORY, useClass: PrismaRefreshTokensRepository },
    // הסדר חשוב: קודם "מי אתה" (401), אחר כך "מה מותר לך" (403)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
