// P29.5-E25: חבילת evals לסוכן — כמה תרחישים, כמה ניסיונות לכל אחד, ודוח
import type Anthropic from "@anthropic-ai/sdk";
import { evaluateTrajectory, type Expectations, type Trajectory } from "./P29.5-E13.ts";

export interface Scenario {
  name: string;
  prompt: string;
  expect: Expectations;
}

export interface RunOutput extends Trajectory {
  costUsd: number;
}

export async function runEvalSuite({
  throw new Error("עוד לא כתבת את הפתרון");
}
