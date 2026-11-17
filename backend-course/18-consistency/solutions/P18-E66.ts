// P18-E66: האם השאילתה משתמשת ב־index? — בקוד
import type { Pool } from "pg";

export type PlanSummary = { nodes: string[]; seqScans: string[]; indexes: string[] };

export async function planSummary(pool: Pool, sql: string, params: unknown[] = []): Promise<PlanSummary> {
  const { rows } = await pool.query(`EXPLAIN (FORMAT JSON) ${sql}`, params);
  const root = rows[0]["QUERY PLAN"][0].Plan;
  const summary: PlanSummary = { nodes: [], seqScans: [], indexes: [] };
  const walk = (node: any) => {
    summary.nodes.push(node["Node Type"]);
    if (node["Node Type"] === "Seq Scan") summary.seqScans.push(node["Relation Name"]);
    if (node["Index Name"] && !summary.indexes.includes(node["Index Name"])) summary.indexes.push(node["Index Name"]);
    for (const child of node.Plans ?? []) walk(child);
  };
  walk(root);
  return summary;
}
