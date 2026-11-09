// P29.5-E15: מוביל ועובדים — כל עובד מתחיל בהקשר נקי, ומחזיר רק סיכום
import type Anthropic from "@anthropic-ai/sdk";

export interface Worker {
  system: string;
  model?: string;
}

const MAX_REPORT = 2000;
const textOf = (m: Anthropic.Message) => m.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");

async function runWorker(client: Anthropic, w: Worker, instructions: string): Promise<string> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function runLead(client: Anthropic, { system, task, workers, maxSteps = 8 }: { system: string; task: string; workers: Record<string, Worker>; maxSteps?: number }): Promise<string> {
  throw new Error("עוד לא כתבת את הפתרון");
}
