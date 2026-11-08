// P25-E25: אתגר — blue/green deployment
export type Color = "blue" | "green";

export interface Platform {
  start(color: Color, version: string): Promise<void>;
  healthy(color: Color): Promise<boolean>;
  stop(color: Color): Promise<void>;
}

export class BlueGreen {
  constructor(platform: Platform) {
    // כתוב כאן
  }

  get live(): { color: Color; version: string } | null {
    return null;
  }

  get history(): string[] {
    return [];
  }

  async deploy(version: string, { attempts = 5 } = {}): Promise<boolean> {
    return false;
  }

  async rollback(): Promise<boolean> {
    return false;
  }

  async retireIdle(): Promise<void> {}
}
