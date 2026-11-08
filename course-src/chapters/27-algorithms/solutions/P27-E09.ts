// P27-E09
// מחסנית: כל פותח נדחף; כל סוגר חייב להתאים לפותח האחרון. מחסנית לא ריקה בסוף ← משהו לא נסגר
const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export function checkBrackets(text: string): { ok: true } | { ok: false; index: number } {
  const stack: number[] = []; // אינדקסים של הפותחים — כדי לדעת איפה הבעיה
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "[" || ch === "{") stack.push(i);
    else if (ch in PAIRS) {
      if (stack.length === 0 || text[stack[stack.length - 1]] !== PAIRS[ch]) return { ok: false, index: i };
      stack.pop();
    }
  }
  return stack.length === 0 ? { ok: true } : { ok: false, index: stack[0] };
}
