import { loadServerConfig } from "./server-config";

describe("loadServerConfig", () => {
  it("פיתוח: ברירות מחדל", () => {
    expect(loadServerConfig({})).toEqual({ production: false, port: 3000, corsOrigins: ["http://localhost:5500"], trustProxy: false });
  });

  it("פרודקשן: הגדרות מלאות", () => {
    const env = { NODE_ENV: "production", PORT: "10000", DATABASE_URL: "postgresql://x", CORS_ORIGINS: "https://a.example.com, https://b.example.com", TRUST_PROXY: "1" };
    expect(loadServerConfig(env)).toEqual({ production: true, port: 10000, corsOrigins: ["https://a.example.com", "https://b.example.com"], trustProxy: 1 });
  });

  it("פרודקשן: בלי CORS_ORIGINS או DATABASE_URL — לא עולה", () => {
    expect(() => loadServerConfig({ NODE_ENV: "production" })).toThrow(/DATABASE_URL.*CORS_ORIGINS/);
  });

  it.each(["http://a.example.com", "*", "https://*.example.com", "https://a.example.com/app"])("פרודקשן: CORS_ORIGINS=%s — לא עולה", (origin) => {
    expect(() => loadServerConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://x", CORS_ORIGINS: origin })).toThrow(/https/);
  });

  it("PORT לא תקין", () => {
    expect(() => loadServerConfig({ PORT: "abc" })).toThrow(/PORT/);
  });
});
