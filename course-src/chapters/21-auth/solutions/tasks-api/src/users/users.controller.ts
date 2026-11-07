import { Controller, Get, Inject } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/auth.decorators";
import { toPublicUser, USERS_REPOSITORY, type UsersRepository } from "./users.repository";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
@Roles("admin")
export class UsersController {
  constructor(@Inject(USERS_REPOSITORY) private readonly users: UsersRepository) {}

  @Get()
  async list() {
    return (await this.users.list()).map(toPublicUser);
  }
}
