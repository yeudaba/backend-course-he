import mysql from "mysql2/promise";
import { loadConfig } from "./config.ts";
import { createQueryServer } from "./query.ts";

const cfg = loadConfig(process.env);
const pool = mysql.createPool({ uri: cfg.MYSQL_URL, connectionLimit: 10, dateStrings: true });
const server = await createQueryServer({ pool, lakeDir: cfg.LAKE_DIR, apiKeys: cfg.API_KEYS });
server.listen(cfg.PORT, () => console.log(JSON.stringify({ level: "info", msg: "query listening", port: cfg.PORT })));
process.on("SIGTERM", () => server.close(async () => (await pool.end(), process.exit(0))));
