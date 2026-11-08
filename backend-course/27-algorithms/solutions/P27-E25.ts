// P27-E25
// Trie: עץ של אותיות. כל צומת שומר גם את ה־k הכי פופולריים מתחתיו — כך suggest לא סורק את כל תת־העץ.
// add מעדכן את הרשימות לאורך המסלול: O(L × k). suggest: O(L) — הליכה לצומת, והרשימה מוכנה
interface Node {
  children: Map<string, Node>;
  top: string[]; // עד MAX מונחים, ממוינים
}

const MAX = 10;

export function createAutocomplete() {
  const root: Node = { children: new Map(), top: [] };
  const weights = new Map<string, number>(); // מונח (lowercase) ← משקל מצטבר
  const display = new Map<string, string>(); // מונח (lowercase) ← הכתיב הראשון שנוסף
  const better = (a: string, b: string) => weights.get(b)! - weights.get(a)! || (a < b ? -1 : a > b ? 1 : 0);

  return {
    add(term: string, weight = 1) {
      const key = term.trim().toLowerCase();
      if (!key) return;
      weights.set(key, (weights.get(key) ?? 0) + weight);
      if (!display.has(key)) display.set(key, term.trim());
      let node = root;
      const path = [root];
      for (const ch of key) {
        let next = node.children.get(ch);
        if (!next) {
          next = { children: new Map(), top: [] };
          node.children.set(ch, next);
        }
        node = next;
        path.push(node);
      }
      for (const n of path) {
        if (!n.top.includes(key)) n.top.push(key);
        n.top.sort(better);
        if (n.top.length > MAX) n.top.length = MAX;
      }
    },
    suggest(prefix: string, k = 5): string[] {
      let node: Node | undefined = root;
      for (const ch of prefix.trim().toLowerCase()) {
        node = node.children.get(ch);
        if (!node) return [];
      }
      return node.top.slice(0, Math.min(k, MAX)).map((key) => display.get(key)!);
    },
    get size() {
      return weights.size;
    },
  };
}
