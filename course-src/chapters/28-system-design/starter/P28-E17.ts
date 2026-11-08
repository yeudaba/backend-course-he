// P28-E17: שירות קיצור קישורים
export interface Link {
  code: string;
  url: string;
  createdAt: number;
  expiresAt: number | null;
  clicks: number;
}

export interface Store {
  get(code: string): Promise<Link | undefined>;
  insert(link: Link): Promise<boolean>; // false אם הקוד תפוס
  incrementClicks(code: string): Promise<void>;
}

// מוכן לשימוש: store בזיכרון
export function memoryStore(): Store & { links: Map<string, Link> } {
  const links = new Map<string, Link>();
  return {
    links,
    get: async (code) => links.get(code),
    insert: async (link) => (links.has(link.code) ? false : (links.set(link.code, { ...link }), true)),
    incrementClicks: async (code) => {
      const l = links.get(code);
      if (l) l.clicks++;
    },
  };
}

export function createShortener(store: Store, options: { newCode: () => string; now?: () => number }) {
  return {
    async create(input: { url: string; alias?: string; ttlSeconds?: number }): Promise<Link> {
      throw new Error("עוד לא כתבת את הפתרון");
    },
    async resolve(code: string): Promise<{ status: 302; location: string } | { status: 404 } | { status: 410 }> {
      throw new Error("עוד לא כתבת את הפתרון");
    },
  };
}
