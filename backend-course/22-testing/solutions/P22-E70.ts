// P22-E70: it.each — טבלה של מקרים ← רשימה של בדיקות עם שמות
export function each<Row>(table: Row[]) {
  return (title: string, fn: (...args: any[]) => void) =>
    table.map((row) => {
      const args: unknown[] = Array.isArray(row) ? row : [row];
      let i = 0;
      const name = title.replace(/%[sd%]/g, (m) => {
        if (m === "%%") return "%";
        const value = args[i++];
        return m === "%d" ? String(Number(value)) : String(value);
      });
      return { name, run: () => fn(...args) };
    });
}
