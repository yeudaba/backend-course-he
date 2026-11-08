// מאגר קבצים משותף ל־E08 ו־E20
export const files = [
  { path: ".env", content: "DATABASE_URL=postgresql://postgres:hunter2@localhost:5432/shop\nJWT_SECRET=4f9c2a7e1b" },
  { path: ".env.example", content: "DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shop\nJWT_SECRET=" },
  { path: "config/.env.production", content: "PORT=3000" },
  { path: "src/ai.ts", content: 'import Anthropic from "@anthropic-ai/sdk";\n\nconst client = new Anthropic({ apiKey: "sk-ant-api03-AbCdEfGhIjKlMnOp" });' },
  { path: "README.md", content: "Set DATABASE_URL=postgresql://user:${DB_PASSWORD}@db:5432/app\nand run docker compose up" },
  { path: "node_modules/pkg/test.js", content: 'const k = "sk-ant-api03-ShouldBeIgnored123";' },
];
