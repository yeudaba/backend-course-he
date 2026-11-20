// P30-E72: "we" או "I"
const WE = new Set(["we", "we're", "we've", "our", "us", "אנחנו", "אנו", "שלנו"]);
const I = new Set(["i", "i'm", "i've", "my", "me", "אני", "שלי"]);

export function weVsI(text: string): { we: number; i: number; verdict: "say_i" | "more_we" | "ok" } {
  let we = 0;
  let i = 0;
  for (const w of text.toLowerCase().split(/[^\p{L}']+/u)) {
    if (WE.has(w)) we++;
    else if (I.has(w)) i++;
  }
  return { we, i, verdict: i === 0 || we > 0 ? "say_i" : we > i ? "more_we" : "ok" };
}
