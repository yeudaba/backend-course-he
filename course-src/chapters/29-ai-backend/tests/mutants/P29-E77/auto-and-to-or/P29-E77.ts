// P29-E77: לסווג שגיאה של ה־API
import Anthropic from "@anthropic-ai/sdk";

type Kind = "rate_limited" | "overloaded" | "timeout" | "network" | "bad_request" | "config" | "bug";
const RETRY: Kind[] = ["rate_limited", "overloaded", "timeout", "network"];

export function classifyApiError(err: unknown) {
  let kind: Kind = "bug";
  let status: number | null = null;
  if (err instanceof Anthropic.APIConnectionTimeoutError) kind = "timeout";
  else if (err instanceof Anthropic.APIConnectionError) kind = "network";
  else if (err instanceof Anthropic.APIError || typeof err.status === "number") {
    status = err.status;
    if (status === 429) kind = "rate_limited";
    else if (status >= 500) kind = "overloaded";
    else if (status === 401 || status === 403) kind = "config";
    else kind = "bad_request";
  }
  const retryLater = RETRY.includes(kind);
  return { kind, status, retryLater, userMessage: retryLater ? "העוזר עמוס כרגע, נסה שוב בעוד דקה" : "משהו השתבש אצלנו, כבר בודקים" };
}
