// P25-E25
export type Color = "blue" | "green";

export interface Platform {
  start(color: Color, version: string): Promise<void>;
  healthy(color: Color): Promise<boolean>;
  stop(color: Color): Promise<void>;
}

// blue/green: שתי "סביבות". אחת מקבלת תנועה; את החדשה מעלים בשנייה, בודקים — ורק אז מעבירים תנועה.
// rollback = להעביר את התנועה בחזרה, מיד, כי הישנה עוד רצה
export class BlueGreen {
  #platform: Platform;
  #live: Color | null = null;
  #versions: Partial<Record<Color, string>> = {};
  #history: string[] = [];

  constructor(platform: Platform) {
    this.#platform = platform;
  }

  get live() {
    return this.#live === null ? null : { color: this.#live, version: this.#versions[this.#live]! };
  }

  get history() {
    return [...this.#history];
  }

  async deploy(version: string, { attempts = 5 } = {}): Promise<boolean> {
    const idle: Color = this.#live === "blue" ? "green" : "blue";
    await this.#platform.start(idle, version);
    this.#versions[idle] = version;
    for (let i = 0; i < attempts; i++) {
      if (await this.#platform.healthy(idle)) {
        this.#live = idle; // המעבר עצמו — אטומי. אף בקשה לא מגיעה לגרסה שלא עברה בדיקה
        this.#history.push(version);
        return true;
      }
    }
    await this.#platform.stop(idle); // לא עבר — עוצרים. התנועה בכלל לא זזה
    delete this.#versions[idle];
    return false;
  }

  async rollback(): Promise<boolean> {
    if (this.#live === null) return false;
    const other: Color = this.#live === "blue" ? "green" : "blue";
    if (!this.#versions[other] || !(await this.#platform.healthy(other))) return false;
    this.#live = other;
    this.#history.push(this.#versions[other]!);
    return true;
  }

  // אחרי שהחדשה יציבה — משחררים את הישנה (וגם את האפשרות ל־rollback מיידי)
  async retireIdle(): Promise<void> {
    if (this.#live === null) return;
    const other: Color = this.#live === "blue" ? "green" : "blue";
    if (this.#versions[other]) {
      await this.#platform.stop(other);
      delete this.#versions[other];
    }
  }
}
