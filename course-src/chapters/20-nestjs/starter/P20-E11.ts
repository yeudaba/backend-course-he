// P20-E11: GET /greeting ← ברכה לפי השעה ב־UTC. השעה מגיעה מ־provider בשם CLOCK
import { Controller, Get, Inject, Injectable, Module } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

// כתוב כאן GreetingService (עם @Inject(CLOCK)) ו־GreetingController

@Module({ controllers: [], providers: [] })
export class GreetingModule {}
