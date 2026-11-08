import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import type { Request } from "express";

export type Role = "customer" | "admin";
export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export const IS_PUBLIC = "isPublic";
export const ROLES = "roles";

// ברירת המחדל: כל נתיב דורש התחברות. @Public() — יוצא מן הכלל, במפורש
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<Request & { user: AuthUser }>().user);
