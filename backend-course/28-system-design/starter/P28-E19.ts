// P28-E19: פיד היברידי — fan-out on write, וסלבריטאים on read
export interface Post {
  id: number;
  author: string;
  at: number;
}

export function createFeed(options: { celebrityThreshold?: number; timelineCap?: number } = {}): {
  stats: { timelineWrites: number };
  follow(user: string, target: string): void;
  post(author: string, at: number): Post;
  timeline(user: string, limit?: number): Post[];
} {
  throw new Error("עוד לא כתבת את הפתרון");
}
