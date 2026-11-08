// P28-E19
// פיד: fan-out on write (כל פוסט נכתב לפיד של כל עוקב) — קריאה מהירה; אבל לסלבריטי עם מיליון עוקבים זה מיליון כתיבות.
// היברידי: לסלבריטאים — fan-out on read (מושכים את הפוסטים שלהם בזמן הקריאה וממזגים)
export interface Post {
  id: number;
  author: string;
  at: number;
}

export function createFeed({ celebrityThreshold = 1000, timelineCap = 500 }: { celebrityThreshold?: number; timelineCap?: number } = {}) {
  const followers = new Map<string, Set<string>>();
  const following = new Map<string, Set<string>>();
  const timelines = new Map<string, Post[]>(); // החדש ראשון
  const postsBy = new Map<string, Post[]>(); // החדש ראשון
  const stats = { timelineWrites: 0 };
  let nextId = 1;

  const set = (m: Map<string, Set<string>>, k: string) => m.get(k) ?? m.set(k, new Set()).get(k)!;
  const isCelebrity = (u: string) => (followers.get(u)?.size ?? 0) >= celebrityThreshold;
  const newestFirst = (a: Post, b: Post) => b.at - a.at || b.id - a.id;

  return {
    stats,
    follow(user: string, target: string) {
      set(followers, target).add(user);
      set(following, user).add(target);
    },
    post(author: string, at: number): Post {
      const p = { id: nextId++, author, at };
      (postsBy.get(author) ?? postsBy.set(author, []).get(author)!).unshift(p);
      if (!isCelebrity(author)) {
        for (const f of followers.get(author) ?? []) {
          const tl = timelines.get(f) ?? timelines.set(f, []).get(f)!;
          tl.unshift(p);
          if (tl.length > timelineCap) tl.length = timelineCap;
          stats.timelineWrites++;
        }
      }
      return p;
    },
    timeline(user: string, limit = 20): Post[] {
      // Map לפי id: פוסט של מי שהפך לסלבריטי אחרי שפרסם — כבר בפיד, וגם נמשך עכשיו. לא להציג פעמיים
      const merged = new Map((timelines.get(user) ?? []).map((p) => [p.id, p]));
      for (const t of following.get(user) ?? []) {
        if (isCelebrity(t)) for (const p of (postsBy.get(t) ?? []).slice(0, limit)) merged.set(p.id, p);
      }
      return [...merged.values()].sort(newestFirst).slice(0, limit);
    },
  };
}
