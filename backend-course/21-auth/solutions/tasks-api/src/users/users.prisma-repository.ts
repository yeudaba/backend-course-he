import { Injectable } from "@nestjs/common";
import { Prisma, type User as UserRow } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { User, UsersRepository } from "./users.repository";

const toUser = (row: UserRow): User => ({ ...row, createdAt: row.createdAt.toISOString() });

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toUser(row) : undefined;
  }

  async findById(id: number) {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : undefined;
  }

  async insert(data: Omit<User, "id">) {
    try {
      return toUser(await this.prisma.user.create({ data: { ...data, createdAt: new Date(data.createdAt) } }));
    } catch (err) {
      // P2002 = הפרת unique: מישהו נרשם עם אותו אימייל בדיוק באותו רגע
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return undefined;
      throw err;
    }
  }

  async list() {
    return (await this.prisma.user.findMany({ orderBy: { id: "asc" } })).map(toUser);
  }
}
