// P20-E17
import { Controller, Get, Inject, Module } from "@nestjs/common";
import { z } from "zod";

export const ENV = "ENV";
export const CONFIG = "CONFIG";

export const configSchema = z.object({
  APP_NAME: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DEBUG: z.enum(["true", "false"]).transform((v) => v === "true").default(false),
});
export type Config = z.infer<typeof configSchema>;

export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`הגדרות לא תקינות — ${problems}`);
  }
  return result.data;
}

@Controller("info")
export class InfoController {
  constructor(@Inject(CONFIG) private readonly config: Config) {}

  @Get()
  info() {
    return { name: this.config.APP_NAME, port: this.config.PORT, debug: this.config.DEBUG };
  }
}

@Module({
  controllers: [InfoController],
  providers: [
    { provide: ENV, useValue: process.env },
    { provide: CONFIG, useFactory: (env: Record<string, string | undefined>) => loadConfig(env), inject: [ENV] },
  ],
})
export class ConfigModule {}
