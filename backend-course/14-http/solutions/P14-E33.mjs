// P14-E33: מה מותר לכל method
export function methodInfo(method) {
  const m = String(method).trim().toUpperCase();
  switch (m) {
    case "GET":
    case "DELETE":
      return { hasBody: false, idempotent: true };
    case "PUT":
      return { hasBody: true, idempotent: true };
    case "POST":
    case "PATCH":
      return { hasBody: true, idempotent: false };
    default:
      throw new Error(`method לא מוכר: ${method}`);
  }
}

for (const m of ["GET", "post", " Put ", "PATCH", "delete"]) console.log(m.trim(), methodInfo(m));
try {
  methodInfo("FETCH");
} catch (err) {
  console.log(err.message);
}
