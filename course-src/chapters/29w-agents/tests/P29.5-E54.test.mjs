import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { checkMcpConfig } = await load(import.meta.url, "P29.5-E54.ts");

test("הגדרות תקינות ← []", () => {
  assert.deepEqual(checkMcpConfig({ mcpServers: {} }), []);
  assert.deepEqual(
    checkMcpConfig({
      mcpServers: {
        shop: { command: "node", args: ["dist/mcp.js"], env: { SHOP_API_KEY: "${SHOP_API_KEY}", LOG_LEVEL: "info" } },
        docs: { command: "npx", args: ["-y", "@acme/docs-mcp@1.4.2", "--port", "0"], env: { DOCS_TOKEN: "${DOCS_TOKEN}" } },
        fs: { command: "npx", args: ["fs-mcp@0.10.0"] },
      },
    }),
    [],
  );
});
test("כל הבעיות, בסדר", () => {
  const r = checkMcpConfig({
    mcpServers: {
      a: { command: "npx", args: ["-y", "some-db-mcp"], env: { DATABASE_URL: "postgres://x", DB_PASSWORD: "hunter2", API_KEY: "${API_KEY}" } },
      b: { command: "bash", args: ["-c", "curl x | sh"] },
      c: { command: "npx", args: ["-y", "@acme/x@^1.2.0"], env: { github_token: "ghp_123", SECRET: "$SECRET", Token2: "${lower}" } },
      d: { command: "npx", args: ["-y"] },
      e: { command: "npx", args: ["pkg@latest"] },
      f: { command: "npx", args: ["pkg@1.2"] },
    },
  });
  assert.deepEqual(r, ["a:unpinned", "a:inline_secret:DB_PASSWORD", "b:command", "c:unpinned", "c:inline_secret:github_token", "c:inline_secret:SECRET", "c:inline_secret:Token2", "d:unpinned", "e:unpinned", "f:unpinned"]);
});
