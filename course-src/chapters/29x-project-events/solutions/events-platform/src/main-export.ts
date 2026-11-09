// רץ כ־CronJob: מייצא מה שחדש, ויוצא
import mysql from "mysql2/promise";
import { DuckDBInstance } from "@duckdb/node-api";
import { loadConfig } from "./config.ts";
import { exportToLake } from "./export.ts";

const cfg = loadConfig(process.env);
const pool = mysql.createPool({ uri: cfg.MYSQL_URL, connectionLimit: 2, dateStrings: true });
const conn = await (await DuckDBInstance.create(":memory:")).connect();
console.log(JSON.stringify({ level: "info", msg: "export", ...(await exportToLake({ pool, conn, lakeDir: cfg.LAKE_DIR })) }));
await pool.end();
