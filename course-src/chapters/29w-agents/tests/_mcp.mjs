// עוזר לבדיקות של יחידה 29.5: מחבר client של MCP לשרת שלך בזיכרון (InMemoryTransport) — בלי תהליך ובלי רשת
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

export async function connect(t, server) {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: "checker", version: "1.0.0" });
  await client.connect(b);
  t.after(() => client.close());
  const call = async (name, args) => {
    const r = await client.callTool({ name, arguments: args });
    return { text: r.content.map((c) => c.text ?? "").join("\n"), isError: !!r.isError };
  };
  return { client, call };
}
