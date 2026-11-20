// P28-E90: פיד עם תקרה
export class FeedStore {
  private feeds = new Map<string, number[]>();
  private cap: number;

  constructor(cap = 500) {
    this.cap = cap;
  }

  add(userId: string, postId: number): void {
    let list = this.feeds.get(userId);
    if (!list) {
      list = [];
      this.feeds.set(userId, list);
    }
    if (list.includes(postId)) return;
    list.unshift(postId);
    if (list.length > this.cap) list.pop();
  }

  read(userId: string, limit = 20, before?: number): number[] {
    const list = this.feeds.get(userId) ?? [];
    let start = 0;
    if (before !== undefined) {
      const i = list.indexOf(before);

      start = i + 1;
    }
    return list.slice(start, start + limit);
  }

  size(userId: string): number {
    return this.feeds.get(userId)?.length ?? 0;
  }
}
