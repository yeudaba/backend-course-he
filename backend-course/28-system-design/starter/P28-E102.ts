// P28-E102: מיזוג פידים — מהישן, עם כפילויות, ועם פוסט אחד יותר. שלוש תקלות.
// mergeFeeds(lists, limit) ← limit הפוסטים החדשים (createdAt יורד, בתיקו id יורד), כל פוסט פעם אחת, בלי לשנות את הרשימות
//
// בדיקה:  npm run check P28-E102
export type Post = { id: number; createdAt: string; shop: string };

export function mergeFeeds(lists: Post[][], limit: number): Post[] {
  const all = lists.flat().sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);
  return all.slice(0, limit + 1);
}
