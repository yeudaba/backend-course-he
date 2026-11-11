// P14-E37: לבחור status לפי הסדר
export function decideStatus({ method, loggedIn, allowed, exists, valid, duplicate }) {
  if (!loggedIn) return 401;
  if (!allowed) return 403;
  if (method !== "POST" && !exists) return 404;
  if (!valid) return 400;
  if (duplicate) return 409;
  if (method === "POST") return 201;
  if (method === "DELETE") return 204;
  return 200;
}

const ok = { loggedIn: true, allowed: true, exists: true, valid: true, duplicate: false };
console.log(decideStatus({ ...ok, method: "GET" }), decideStatus({ ...ok, method: "POST", exists: false }), decideStatus({ ...ok, method: "DELETE" }));
console.log(decideStatus({ ...ok, method: "GET", loggedIn: false, exists: false }));
console.log(decideStatus({ ...ok, method: "PATCH", exists: false, valid: false }));
console.log(decideStatus({ ...ok, method: "POST", duplicate: true }));
