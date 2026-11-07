import { registerSchema } from "./auth.schema";

describe("registerSchema", () => {
  it("מנרמל אימייל", () => {
    expect(registerSchema.parse({ email: "  Dana@Example.COM ", password: "long-password-1" }).email).toBe("dana@example.com");
  });

  it.each([
    ["קצרה מ־8", "short", false],
    ["8 בדיוק", "12345678", true],
    ["36 אותיות בעברית = 72 בתים", "א".repeat(36), true],
    ["37 אותיות בעברית = 74 בתים", "א".repeat(37), false],
  ])("סיסמה: %s", (_name, password, ok) => {
    expect(registerSchema.safeParse({ email: "a@example.com", password }).success).toBe(ok);
  });

  it("role בגוף הבקשה — נדחה (mass assignment)", () => {
    expect(registerSchema.safeParse({ email: "a@example.com", password: "long-password-1", role: "admin" }).success).toBe(false);
  });
});
