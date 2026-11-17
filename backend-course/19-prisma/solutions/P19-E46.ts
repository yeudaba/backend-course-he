// P19-E46: מה יש בכתובת המסד?
export function describeDbUrl(url: string) {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("כתובת מסד לא תקינה");
  }
  const database = decodeURIComponent(u.pathname.slice(1));
  if (!["postgresql:", "postgres:"].includes(u.protocol) || database === "" || database.includes("/")) {
    throw new Error("כתובת מסד לא תקינה");
  }
  return {
    host: u.hostname,
    port: u.port === "" ? 5432 : Number(u.port),
    database,
    user: decodeURIComponent(u.username),
    password: u.password === "" ? null : "***",
  };
}

console.log(describeDbUrl("postgresql://postgres:s3cret@localhost:5433/shop?schema=public"));
console.log(describeDbUrl("postgres://localhost/course"));
