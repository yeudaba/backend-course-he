// P21-E93: AuthSession — access בזיכרון, refresh ב־storage
export type StorageLike = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
type Tokens = { accessToken: string; refreshToken: string };

const KEY = "refreshToken";

export class AuthSession {
  #access: string | null = null;
  readonly #baseUrl: string;
  readonly #storage: StorageLike;

  constructor(baseUrl: string, storage: StorageLike) {
    this.#baseUrl = baseUrl;
    this.#storage = storage;
  }

  get accessToken(): string | null {
    return this.#access;
  }

  #post(path: string, body: unknown) {
    return fetch(this.#baseUrl + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  }

  #save(t: Tokens) {
    this.#access = t.accessToken;
    this.#storage.setItem(KEY, t.refreshToken);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await this.#post("/auth/login", { email, password });
    const data = await res.json();
    if (res.status !== 200) throw new Error(data.message);
    this.#save(data);
  }

  async restore(): Promise<boolean> {
    const refreshToken = this.#storage.getItem(KEY);
    if (!refreshToken) return false;
    const res = await this.#post("/auth/refresh", { refreshToken });
    if (res.status !== 200) {
      this.#storage.removeItem(KEY);
      return false;
    }
    this.#save(await res.json());
    return true;
  }

  async logout(): Promise<void> {
    const refreshToken = this.#storage.getItem(KEY);
    if (refreshToken) await this.#post("/auth/logout", { refreshToken }).catch(() => {});
    this.#access = null;
    this.#storage.removeItem(KEY);
  }
}
