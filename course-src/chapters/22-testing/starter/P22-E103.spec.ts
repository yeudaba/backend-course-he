// P22-E103: בדיקות Jest ל־formatDuration — נכשלות על קוד תקין. שלוש טעויות, ובאג אחד שאף בדיקה לא תופסת.
// הקוד ב־P22-E103.ts תקין, ולא משנים אותו.
//
// בדיקה:  npm run check P22-E103
import { formatDuration } from "./P22-E103";

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [65, "1:05"],
    [3600, "60:00"],
    [3725, "1:02:05"],
  ])("%d שניות ← %s", (expected, seconds) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it("שלילי ← RangeError", () => {
    expect(formatDuration(-1)).toThrow(RangeError);
  });
});
