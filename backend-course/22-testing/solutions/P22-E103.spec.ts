// P22-E103 — בדיקות ב־Jest, מתוקנות
import { formatDuration } from "./P22-E103";

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [65, "1:05"],
    [3600, "1:00:00"],
    [3725, "1:02:05"],
  ])("%d שניות ← %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it.each([-1, 1.5])("%p ← RangeError", (bad) => {
    expect(() => formatDuration(bad)).toThrow(RangeError);
  });
});
