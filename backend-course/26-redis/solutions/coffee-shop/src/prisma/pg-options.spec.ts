import { pgConnectionOptions } from "./pg-options";

describe("pgConnectionOptions", () => {
  it("בלי sslmode — כמו שהוא, בלי TLS", () => {
    expect(pgConnectionOptions("postgresql://u:p@localhost:5432/db")).toEqual({ connectionString: "postgresql://u:p@localhost:5432/db" });
  });

  it("sslmode=require (Neon) ← TLS עם בדיקת תעודה, ו־sslmode יוצא מהכתובת", () => {
    expect(pgConnectionOptions("postgresql://u:p@ep-x.neon.tech/db?sslmode=require&channel_binding=require")).toEqual({
      connectionString: "postgresql://u:p@ep-x.neon.tech/db",
      ssl: { rejectUnauthorized: true },
    });
  });

  it("sslmode=disable ← בלי TLS", () => {
    expect(pgConnectionOptions("postgresql://u:p@db:5432/db?sslmode=disable")).toEqual({ connectionString: "postgresql://u:p@db:5432/db" });
  });
});
