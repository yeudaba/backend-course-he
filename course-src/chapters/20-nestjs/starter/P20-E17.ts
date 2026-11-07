// P20-E17: CONFIG שנבנה מ־ENV עם Zod (useFactory + inject). הגדרות לא תקינות ← האפליקציה לא עולה
import { Controller, Get, Inject, Module } from "@nestjs/common";
import { z } from "zod";

export const ENV = "ENV";
export const CONFIG = "CONFIG";

export const configSchema = z.object({
  // APP_NAME: חובה | PORT: 1–65535, ברירת מחדל 3000 | DEBUG: "true"/"false" ← בוליאני, ברירת מחדל false
});
export type Config = z.infer<typeof configSchema>;

export function loadConfig(env: Record<string, string | undefined>) {
  // כתוב כאן
}

// כתוב כאן InfoController

@Module({ controllers: [], providers: [] })
export class ConfigModule {}
