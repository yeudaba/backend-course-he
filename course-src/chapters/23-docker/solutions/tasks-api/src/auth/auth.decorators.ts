import { createParamDecorator, SetMetadata, type ExecutionContext } from "@nestjs/common";
import type { Role } from "../users/users.repository";

// מי שמחובר — מה שה־guard שם ב־req.user
export interface AuthUser {
  id: number;
  role: Role;
}

export const IS_PUBLIC = "isPublic";
export const ROLES = "roles";

// ברירת המחדל: כל route דורש התחברות. @Public() — יוצא מן הכלל, במפורש
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});
