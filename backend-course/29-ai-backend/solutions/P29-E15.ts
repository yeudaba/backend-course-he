// P29-E15
import type Anthropic from "@anthropic-ai/sdk";

// streaming ללקוח: האירועים של ה־SDK ← Server-Sent Events. רק טקסט יוצא החוצה (לא thinking, לא tool input),
// כל שורת data היא JSON (כך ירידות שורה בטקסט לא שוברות את הפורמט), ובסוף — event: done עם stop_reason
export async function streamToSse(events: AsyncIterable<Anthropic.MessageStreamEvent>, write: (chunk: string) => void): Promise<{ chars: number }> {
  let chars = 0;
  let stopReason: string | null = null;
  try {
    for await (const event of events) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        chars += event.delta.text.length;
        write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      } else if (event.type === "message_delta") {
        stopReason = event.delta.stop_reason ?? stopReason;
      }
    }
  } catch (err) {
    // הזרם כבר התחיל — אי אפשר להחזיר 500. מודיעים בתוך הזרם, והלקוח מציג "משהו השתבש"
    write(`event: error\ndata: ${JSON.stringify({ message: "התשובה נקטעה" })}\n\n`);
    throw err;
  }
  write(`event: done\ndata: ${JSON.stringify({ stop_reason: stopReason })}\n\n`);
  return { chars };
}
