import fs from "node:fs";
import path from "node:path";
import { Controller, Get, Inject } from "@nestjs/common";
import { Public } from "./auth/auth.decorators";
import { HttpError } from "./errors";
import { PrismaService } from "./prisma/prisma.service";

// מה רץ עכשיו בשרת: גרסה מ־package.json, ו־commit מהפלטפורמה (Render נותנת RENDER_GIT_COMMIT) או מ־GIT_COMMIT
export const BUILD_INFO = "BUILD_INFO";
export interface BuildInfo {
  name: string;
  version: string;
  commit: string;
  startedAt: string;
}

export function readBuildInfo(env: Record<string, string | undefined> = process.env): BuildInfo {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")) as { name: string; version: string };
  return { name: pkg.name, version: pkg.version, commit: env.GIT_COMMIT ?? env.RENDER_GIT_COMMIT ?? "dev", startedAt: new Date().toISOString() };
}

const withTimeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms).unref())]);

@Public()
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BUILD_INFO) private readonly build: BuildInfo,
  ) {}

  // liveness: "התהליך חי". בלי מסד — אחרת תקלה רגעית במסד גורמת לפלטפורמה להרוג שרת תקין
  @Get("health")
  health() {
    return { ok: true };
  }

  // readiness: "אפשר לשלוח אליי בקשות" — כולל המסד, עם גבול זמן
  @Get("ready")
  async ready() {
    try {
      await withTimeout(this.prisma.$queryRaw`SELECT 1`, 2000);
      return { ok: true, db: "up" };
    } catch {
      throw new HttpError(503, "NOT_READY", "המסד לא זמין");
    }
  }

  @Get("version")
  version() {
    return this.build;
  }
}
