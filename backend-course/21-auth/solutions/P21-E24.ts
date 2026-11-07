// P21-E24
import { createHash, randomBytes } from "node:crypto";
import {
  Body, CanActivate, ConflictException, Controller, createParamDecorator, Delete, ExecutionContext, ForbiddenException, Get,
  HttpCode, Inject, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, SetMetadata, UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { APP_GUARD, APP_PIPE, Reflector } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { IsEmail, IsString, IsUrl, Length, MinLength } from "class-validator";
import type { Request } from "express";

// ---------- tokens ----------
export const CLOCK = "CLOCK";
export const CONFIG = "CONFIG";
export interface Clock {
  now(): Date;
}
export interface Config {
  jwtSecret: string;
  accessTtlSeconds: number;
  refreshTtlDays: number;
  bcryptRounds: number;
}
type Role = "user" | "admin";
interface AuthUser {
  id: number;
  role: Role;
}

// ---------- decorators ----------
const IS_PUBLIC = "isPublic";
const ROLES = "roles";
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
export const CurrentUser = createParamDecorator((_d: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user);

// ---------- DTOs ----------
export class CredentialsDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}
export class RefreshDto {
  @IsString() @MinLength(1) refreshToken: string;
}
export class CreateBookmarkDto {
  @IsUrl({ require_protocol: true }) url: string;
  @IsString() @Length(1, 200) title: string;
}

// ---------- users ----------
interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
}
const toPublic = ({ passwordHash, ...user }: User) => user;

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  constructor(@Inject(CONFIG) private readonly config: Config) {}

  async create(email: string, password: string, role: Role = "user") {
    email = email.trim().toLowerCase();
    if (this.users.some((u) => u.email === email)) throw new ConflictException("האימייל כבר רשום");
    const user = { id: this.users.length + 1, email, passwordHash: await bcrypt.hash(password, this.config.bcryptRounds), role };
    this.users.push(user);
    return toPublic(user);
  }

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email.trim().toLowerCase());
  }

  findById(id: number) {
    return this.users.find((u) => u.id === id);
  }

  list() {
    return this.users.map(toPublic);
  }
}

// ---------- auth ----------
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const relogin = () => new UnauthorizedException("צריך להתחבר מחדש");

@Injectable()
export class AuthService {
  private readonly refresh = new Map<string, { userId: number; expiresAt: number; revoked: boolean }>();
  private readonly dummy: Promise<string>;

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @Inject(CONFIG) private readonly config: Config,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {
    this.dummy = bcrypt.hash("dummy-password-nobody-knows", config.bcryptRounds);
  }

  private nowSeconds() {
    return Math.floor(this.clock.now().getTime() / 1000);
  }

  private async issue(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role, iat: this.nowSeconds() }, { expiresIn: this.config.accessTtlSeconds });
    const refreshToken = randomBytes(32).toString("base64url");
    this.refresh.set(sha256(refreshToken), { userId: user.id, expiresAt: this.clock.now().getTime() + this.config.refreshTtlDays * 86_400_000, revoked: false });
    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = this.users.findByEmail(email);
    const ok = await bcrypt.compare(password, user ? user.passwordHash : await this.dummy);
    if (!user || !ok) throw new UnauthorizedException("אימייל או סיסמה שגויים");
    return this.issue(user);
  }

  async rotate(token: string) {
    const record = this.refresh.get(sha256(token));
    if (!record) throw relogin();
    if (record.revoked) {
      for (const r of this.refresh.values()) if (r.userId === record.userId) r.revoked = true;
      throw relogin();
    }
    if (record.expiresAt <= this.clock.now().getTime()) throw relogin();
    record.revoked = true;
    const user = this.users.findById(record.userId);
    if (!user) throw relogin();
    return this.issue(user);
  }

  logout(token: string) {
    const record = this.refresh.get(sha256(token));
    if (record) record.revoked = true;
  }

  async verify(token: string): Promise<AuthUser> {
    try {
      const p = await this.jwt.verifyAsync<{ sub: number; role: Role }>(token, { clockTimestamp: this.nowSeconds() });
      return { id: p.sub, role: p.role };
    } catch {
      throw new UnauthorizedException("טוקן לא תקין");
    }
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const match = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");
    if (!match) throw new UnauthorizedException("נדרשת התחברות");
    req.user = await this.auth.verify(match[1]);
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException("אין הרשאה");
    return true;
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  @Public() @Post("register")
  register(@Body() dto: CredentialsDto) {
    return this.users.create(dto.email, dto.password); // role תמיד user
  }

  @Public() @Post("login") @HttpCode(200)
  login(@Body() dto: CredentialsDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Public() @Post("refresh") @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.rotate(dto.refreshToken);
  }

  @Public() @Post("logout") @HttpCode(204)
  logout(@Body() dto: RefreshDto) {
    this.auth.logout(dto.refreshToken);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    const found = this.users.findById(user.id);
    if (!found) throw new UnauthorizedException("טוקן לא תקין");
    return toPublic(found);
  }
}

// ---------- bookmarks ----------
interface Bookmark {
  id: number;
  ownerId: number;
  url: string;
  title: string;
}

@Injectable()
export class BookmarksService {
  private readonly items: Bookmark[] = [];
  private nextId = 1;

  list(ownerId: number) {
    return this.items.filter((b) => b.ownerId === ownerId).map(({ ownerId: _o, ...b }) => b);
  }

  create(ownerId: number, dto: CreateBookmarkDto) {
    const item = { id: this.nextId++, ownerId, url: dto.url, title: dto.title };
    this.items.push(item);
    return { id: item.id, url: item.url, title: item.title };
  }

  remove(ownerId: number, id: number) {
    const index = this.items.findIndex((b) => b.id === id && b.ownerId === ownerId);
    if (index === -1) throw new NotFoundException(`סימנייה ${id} לא נמצאה`);
    this.items.splice(index, 1);
  }
}

@Controller("bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.bookmarks.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookmarkDto) {
    return this.bookmarks.create(user.id, dto);
  }

  @Delete(":id") @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param("id", ParseIntPipe) id: number) {
    this.bookmarks.remove(user.id, id);
  }
}

@Controller("admin")
@Roles("admin")
export class AdminController {
  constructor(private readonly users: UsersService) {}

  @Get("users")
  listUsers() {
    return this.users.list();
  }
}

// CONFIG ו־CLOCK ב־module משלהם: JwtModule.registerAsync צריך לייבא אותו כדי לקבל את CONFIG
@Module({
  providers: [
    { provide: CLOCK, useValue: { now: () => new Date() } },
    { provide: CONFIG, useValue: { jwtSecret: "change-me-change-me-change-me-0123456789", accessTtlSeconds: 900, refreshTtlDays: 7, bcryptRounds: 12 } },
  ],
  exports: [CLOCK, CONFIG],
})
export class CoreModule {}

@Module({
  imports: [
    CoreModule,
    JwtModule.registerAsync({ imports: [CoreModule], inject: [CONFIG], useFactory: (c: Config) => ({ secret: c.jwtSecret }) }),
  ],
  controllers: [AuthController, BookmarksController, AdminController],
  providers: [
    UsersService,
    AuthService,
    BookmarksService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useFactory: () => new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }) },
  ],
})
export class BookmarksAppModule {}
