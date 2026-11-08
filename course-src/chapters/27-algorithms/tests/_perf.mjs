// עוזרים לבדיקות של פרק 27: מדידת זמן, ומערך "סופר קריאות" (לבדוק שחיפוש בינארי באמת לוגריתמי)
import assert from "node:assert/strict";

// מריץ את fn ובודק שלקח פחות מ־ms. הגבולות נדיבים: פתרון בסיבוכיות הנכונה רחוק מהם מאוד
export function fastEnough(fn, ms, what) {
  const t0 = performance.now();
  const result = fn();
  const took = performance.now() - t0;
  assert.ok(took < ms, `${what}: לקח ${Math.round(took)}ms (מותר עד ${ms}ms) — כנראה סיבוכיות גבוהה מדי (לולאה בתוך לולאה? includes/indexOf/some בתוך לולאה?)`);
  return result;
}

// מערך לקריאה בלבד שסופר כמה פעמים קראו תא (sorted[i])
export function countingArray(values) {
  const stats = { reads: 0 };
  const proxy = new Proxy(values, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && /^\d+$/.test(prop)) stats.reads++;
      return Reflect.get(target, prop, receiver);
    },
  });
  return { array: proxy, stats };
}

// מספרים "אקראיים" קבועים — אותה סדרה בכל ריצה
export function seeded(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
