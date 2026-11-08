// P29-E25: answerFromDocs — RAG בקטן, עם מקורות
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = "claude-opus-5-5";

export interface Doc {
  id: string;
  title: string;
  text: string;
}

export function retrieve(question: string, docs: readonly Doc[], k = 3): Doc[] {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function answerFromDocs(client: Anthropic, question: string, docs: readonly Doc[]): Promise<{ answer: string; sources: string[]; called: boolean }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
