// P16-E39: SELECT ב־JavaScript
type Row = Record<string, unknown>;

export function select(rows: Row[], columns: string[], where: Row = {}): Row[] {
  if (rows.length > 0) {
    const known = Object.keys(rows[0]);
    for (const name of [...columns, ...Object.keys(where)]) {
      if (!known.includes(name)) throw new Error(`column "${name}" does not exist`);
    }
  }
  return rows
    .filter((row) => Object.entries(where).every(([col, value]) => row[col] === value))
    .map((row) => Object.fromEntries(columns.map((col) => [col, row[col]])));
}

const products = [
  { id: 5, name: "Hand Grinder", category: "grinders", price: 189 },
  { id: 6, name: "Electric Grinder Pro", category: "grinders", price: 649 },
  { id: 7, name: "French Press 1L", category: "brewing", price: 119 },
];
console.log(select(products, ["name", "price"], { category: "grinders" }));
console.log(select(products, ["id"], { category: "grinders", price: 649 }));
try {
  select(products, ["name"], { categroy: "brewing" });
} catch (err) {
  console.log((err as Error).message);
}
