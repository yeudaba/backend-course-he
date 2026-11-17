// P21-E91: P2002 (unique) ← undefined, ו־service יחליט שזה 409
export type UserRow = { id: number; email: string; passwordHash: string; role: "user" | "admin" };
export type PrismaLike = {
  user: {
    create(args: { data: Omit<UserRow, "id"> }): Promise<UserRow>;
    findUnique(args: { where: { email: string } }): Promise<UserRow | null>;
  };
};

export class UsersRepository {
  private readonly prisma: PrismaLike;

  constructor(prisma: PrismaLike) {
    this.prisma = prisma;
  }

  async insert(data: Omit<UserRow, "id">): Promise<UserRow | undefined> {
    try {
      return await this.prisma.user.create({ data });
    } catch (err) {
      if ((err as { code?: string }).code === "P2002") return undefined;
      throw err;
    }
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return (await this.prisma.user.findUnique({ where: { email } })) ?? undefined;
  }
}
