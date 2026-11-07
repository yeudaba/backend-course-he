// P20-E06: GET /hello?name=דנה → { message: "שלום דנה" } (בלי name → "שלום אורח")
import { Controller, Get, Module, Query } from "@nestjs/common";

// כתוב כאן HelloController

@Module({ controllers: [] })
export class HelloModule {}
