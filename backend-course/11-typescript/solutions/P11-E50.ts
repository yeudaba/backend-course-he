// P11-E50: ספר בספרייה
export type Book = {
  readonly isbn: string;
  title: string;
  author: string;
  year: number;
  subtitle?: string;
};

export function bookLabel(b: Book): string {
  const sub = b.subtitle ? `: ${b.subtitle}` : "";
  return `${b.title}${sub} (${b.author}, ${b.year})`;
}

export function oldest(books: Book[]): Book | undefined {
  let best: Book | undefined;
  for (const b of books) {
    if (best === undefined || b.year < best.year) best = b;
  }
  return best;
}

const books: Book[] = [
  { isbn: "1", title: "דיונה", author: "הרברט", year: 1965 },
  { isbn: "2", title: "1984", author: "אורוול", year: 1949, subtitle: "רומן" },
];
console.log(books.map(bookLabel));
console.log(oldest(books)?.title, oldest([]));
