import mysql from "mysql2/promise";
import { loadConfig } from "./config.ts";
import { runProcessor } from "./processor.ts";

const cfg = loadConfig(process.env);
const pool = mysql.createPool({ uri: cfg.MYSQL_URL, connectionLimit: 5, dateStrings: true });
let stopping = false;
process.on("SIGTERM", () => (stopping = true));
while (!stopping) {
  const s = await runProcessor({ brokers: cfg.KAFKA_BROKERS, topic: cfg.EVENTS_TOPIC, groupId: "events-processor", pool, max: 1000 });
  console.log(JSON.stringify({ level: "info", msg: "batch", ...s }));
}
await pool.end();
