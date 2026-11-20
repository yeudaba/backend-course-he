// P29-E92: בדיקות קטנות שמרכיבים
type Check = (output: string) => true | string;

const has = (output: string, w: string) => output.toLowerCase().includes(w.toLowerCase());

export function includesAll(words: string[]): Check {
  return (output) => {
    const missing = words.filter((w) => !has(output, w));
    return missing.length === 0 ? true : `חסר: ${missing.join(", ")}`;
  };
}

export function excludesAll(words: string[]): Check {
  return (output) => {
    const found = words.filter((w) => has(output, w));
    return found.length !== 0 ? true : `אסור: ${found.join(", ")}`;
  };
}

export function maxWords(n: number): Check {
  return (output) => {
    const count = output.split(/\s+/).filter(Boolean).length;
    return count <= n ? true : `ארוך מדי: ${count} מילים (עד ${n})`;
  };
}

export function all(...checks: Check[]): Check {
  return (output) => {
    const reasons = checks.map((c) => c(output)).filter((r): r is string => r !== true);
    return reasons.length === 0 ? true : reasons.join("; ");
  };
}
