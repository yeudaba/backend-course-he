import fs from "node:fs";
import path from "node:path";
import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "./auth/auth.decorators";
import { HttpError } from "./errors";
import { PrismaService } from "./prisma/prisma.service";

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")) as { name: string; version: string };
const startedAt = new Date().toISOString();

@Public()
@ApiExcludeController()
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  health() {
    return { ok: true };
  }

  @Get("ready")
  async ready() {
    try {
      await Promise.race([this.prisma.$queryRaw`SELECT 1`, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000).unref())]);
      return { ok: true, db: "up" };
    } catch {
      throw new HttpError(503, "NOT_READY", "המסד לא זמין");
    }
  }

  @Get("version")
  version() {
    return { name: pkg.name, version: pkg.version, commit: process.env.GIT_COMMIT ?? process.env.RENDER_GIT_COMMIT ?? "dev", startedAt };
  }
}
