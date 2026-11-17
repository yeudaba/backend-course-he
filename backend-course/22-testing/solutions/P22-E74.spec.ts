// P22-E74 — בדיקות ב־Jest
import { formatDuration } from "./P22-E74";

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [5, "0:05"],
    [59, "0:59"],
    [60, "1:00"],
    [65, "1:05"],
    [3599, "59:59"],
    [3600, "1:00:00"],
    [3661, "1:01:01"],
    [3725, "1:02:05"],
    [36000, "10:00:00"],
  ])("%d שניות ← %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it.each([-1, 1.5, NaN])("%p ← RangeError", (bad) => {
    expect(() => formatDuration(bad)).toThrow(RangeError);
  });
});
