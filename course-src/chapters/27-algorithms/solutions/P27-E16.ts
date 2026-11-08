// P27-E16
// Map ב־JavaScript שומר סדר הכנסה: הראשון = הכי פחות בשימוש. "שימוש" = מוחקים ומכניסים מחדש (לסוף). הכול O(1)
export class LRUCache<K, V> {
  private readonly map = new Map<K, V>();
  private readonly capacity: number;

  // (בלי "constructor(private capacity)": Node מריץ TypeScript בלי קומפילציה, וזה תחביר שאינו JavaScript)
  constructor(capacity: number) {
    this.capacity = capacity;
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error("capacity חייב להיות שלם חיובי");
  }

  get size() {
    return this.map.size;
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value!);
  }

  keys(): K[] {
    return [...this.map.keys()]; // מהישן לחדש
  }
}
