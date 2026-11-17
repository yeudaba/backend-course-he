// P22-E90: עזרי e2e — הרשמה + כניסה בשורה אחת
export type Tokens = { accessToken: string; refreshToken: string };

export async function signUp(baseUrl: string, email: string, password = "password-123"): Promise<Tokens> {
  const post = (path: string, body: unknown) =>
    fetch(baseUrl + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const reg = await post("/auth/register", { email, password });
  if (reg.status !== 201) throw new Error(`signUp(${email}): ${reg.status} ${await reg.text()}`);
  const login = await post("/auth/login", { email, password });
  if (login.status !== 200) throw new Error(`signUp(${email}): ${login.status} ${await login.text()}`);
  const { accessToken, refreshToken } = await login.json();
  return { accessToken, refreshToken };
}

export function auth(token: string): { authorization: string } {
  return { authorization: `Bearer ${token}` };
}
