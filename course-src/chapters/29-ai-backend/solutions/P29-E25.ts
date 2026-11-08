// P29-E25
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = "claude-opus-5-5";

export interface Doc {
  id: string;
  title: string;
  text: string;
}

const Answer = z.object({ answer: z.string(), cited_ids: z.array(z.string()), answerable: z.boolean() });

const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

// שליפה פשוטה: כמה מילים מהשאלה מופיעות במסמך (מילים קצרות — לא נספרות). בפרודקשן: חיפוש מלא או embeddings —
// אבל הרעיון זהה: לתת למודל רק את מה שרלוונטי, ולא את כל המסמכים
export function retrieve(question: string, docs: readonly Doc[], k = 3): Doc[] {
  const q = new Set(words(question).filter((w) => w.length > 2));
  return docs
    .map((d) => {
      const dw = new Set(words(`${d.title} ${d.text}`));
      let score = 0;
      for (const w of q) if (dw.has(w)) score++;
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.d.id < b.d.id ? -1 : 1))
    .slice(0, k)
    .map((x) => x.d);
}

// RAG בקטן: שולפים ← אם אין כלום, עונים "לא יודע" בלי לקרוא למודל ← אחרת שואלים עם המסמכים בתגיות,
// ודורשים מאילו מסמכים התשובה. ציטוט של מסמך שלא נשלח — המודל המציא ← לא מציגים אותו
export async function answerFromDocs(client: Anthropic, question: string, docs: readonly Doc[]): Promise<{ answer: string; sources: string[]; called: boolean }> {
  const found = retrieve(question, docs);
  const NO = { answer: "לא מצאתי תשובה במסמכי החנות. אפשר לפנות לשירות הלקוחות.", sources: [] as string[] };
  if (found.length === 0) return { ...NO, called: false };
  const context = found.map((d) => `<doc id="${d.id}" title="${d.title.replace(/"/g, "'")}">\n${d.text.replace(/<\/?\s*doc\b[^>]*>/gi, "")}\n</doc>`).join("\n");
  const r = await client.messages.parse({
    model: MODEL,
    max_tokens: 2048,
    system:
      "Answer the customer's question in Hebrew using only the shop documents provided in <doc> tags. " +
      "If the documents do not contain the answer, set answerable to false. List the ids of the documents you used in cited_ids.",
    messages: [{ role: "user", content: `${context}\n\nQuestion: ${question}` }],
    output_config: { format: zodOutputFormat(Answer) },
  });
  const out = r.parsed_output;
  if (r.stop_reason !== "end_turn" || !out || !out.answerable) return { ...NO, called: true };
  const allowed = new Set(found.map((d) => d.id));
  const sources = [...new Set(out.cited_ids)].filter((id) => allowed.has(id));
  if (sources.length === 0) return { ...NO, called: true }; // תשובה בלי מקור אמיתי — לא מציגים
  return { answer: out.answer, sources, called: true };
}
