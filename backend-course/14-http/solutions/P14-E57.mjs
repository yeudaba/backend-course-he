// P14-E57: sessions בזיכרון
export class SessionStore {
  #sessions = new Map();

  login(user) {
    const token = crypto.randomUUID();
    this.#sessions.set(token, user);
    return token;
  }

  userFor(headers) {
    const [scheme, token, ...rest] = (headers.authorization ?? "").split(" ");
    if (scheme !== "Bearer" || !token || rest.length > 0) return null;
    return this.#sessions.get(token) ?? null;
  }

  logout(token) {
    return this.#sessions.delete(token);
  }

  get size() {
    return this.#sessions.size;
  }
}

const a = new SessionStore();
const dana = a.login("דנה");
const yossi = a.login("יוסי");
console.log(a.size, dana === yossi);
console.log(a.userFor({ authorization: `Bearer ${dana}` }), a.userFor({ authorization: `Bearer ${yossi}` }));
console.log(a.userFor({}), a.userFor({ authorization: dana }), a.userFor({ authorization: `Basic ${dana}` }));
const b = new SessionStore();
console.log("עותק שני:", b.userFor({ authorization: `Bearer ${dana}` }));
console.log(a.logout(dana), a.logout(dana), a.size, a.userFor({ authorization: `Bearer ${dana}` }));
