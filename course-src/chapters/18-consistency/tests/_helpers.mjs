// עזרים לבדיקות של פרק 18
export function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// עוטף pool וסופר כל שאילתה (גם דרך pool.connect)
export function countingPool(pool) {
  const counter = { n: 0 };
  const wrapped = {
    query: (...a) => { counter.n++; return pool.query(...a); },
    connect: async () => {
      const c = await pool.connect();
      const q = c.query.bind(c);
      c.query = (...a) => { counter.n++; return q(...a); };
      return c;
    },
  };
  return { pool: wrapped, counter };
}

// התוכנית של הפקודה האחרונה בקובץ SQL
export function lastStatement(sqlText) {
  return sqlText.replace(/--.*$/gm, "").split(";").map((s) => s.trim()).filter(Boolean).at(-1);
}

export async function plan(db, query) {
  return (await db.rows(`EXPLAIN (COSTS OFF) ${query}`)).map((r) => r["QUERY PLAN"]).join("\n");
}
