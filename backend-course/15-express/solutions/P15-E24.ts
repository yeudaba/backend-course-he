// P15-E24
import express, { Router, type Request, type Response, type NextFunction } from "express";
import { z, type ZodType } from "zod";

class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface Book { id: number; title: string; author: string; copies: number; available: number }
interface Loan { id: number; bookId: number; member: string; loanedAt: string; dueAt: string; returnedAt: string | null }

const DAY = 24 * 60 * 60 * 1000;

class LibraryService {
  books: Book[] = [];
  loans: Loan[] = [];
  now: () => Date;
  constructor(now: () => Date) {
    this.now = now;
  }
  createBook(data: { title: string; author: string; copies: number }) {
    const book = { id: this.books.length + 1, ...data, available: data.copies };
    this.books.push(book);
    return book;
  }
  listBooks({ author, available }: { author?: string; available?: boolean }) {
    return this.books.filter(
      (b) => (!author || b.author.toLowerCase().includes(author.toLowerCase())) && (!available || b.available > 0)
    );
  }
  getBook(id: number) {
    const book = this.books.find((b) => b.id === id);
    if (!book) throw new HttpError(404, "BOOK_NOT_FOUND", "הספר לא נמצא");
    return book;
  }
  lend(bookId: number, member: string) {
    const book = this.getBook(bookId);
    if (this.loans.some((l) => l.bookId === bookId && l.member === member && !l.returnedAt)) {
      throw new HttpError(409, "ALREADY_BORROWED", "החבר כבר מחזיק את הספר");
    }
    if (book.available === 0) throw new HttpError(409, "NO_COPIES", "אין עותק פנוי");
    book.available--;
    const at = this.now();
    const loan = {
      id: this.loans.length + 1,
      bookId,
      member,
      loanedAt: at.toISOString(),
      dueAt: new Date(at.getTime() + 14 * DAY).toISOString(),
      returnedAt: null,
    };
    this.loans.push(loan);
    return loan;
  }
  returnLoan(id: number) {
    const loan = this.loans.find((l) => l.id === id);
    if (!loan) throw new HttpError(404, "LOAN_NOT_FOUND", "ההשאלה לא נמצאה");
    if (loan.returnedAt) throw new HttpError(409, "ALREADY_RETURNED", "הספר כבר הוחזר");
    loan.returnedAt = this.now().toISOString();
    this.getBook(loan.bookId).available++;
    return loan;
  }
  overdue() {
    const t = this.now().getTime();
    return this.loans.filter((l) => !l.returnedAt && Date.parse(l.dueAt) < t);
  }
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  const r = schema.safeParse(value);
  if (!r.success) {
    const err = new HttpError(400, "VALIDATION_ERROR", "קלט לא תקין");
    Object.assign(err, { details: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
    throw err;
  }
  return r.data;
}

const idSchema = z.coerce.number().int().positive();
const bookSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(200),
  copies: z.number().int().min(1).max(100),
});
const listSchema = z.object({
  author: z.string().optional(),
  available: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
const loanSchema = z.object({ member: z.string().trim().min(1).max(100) });

export function createApp({ now = () => new Date() }: { now?: () => Date } = {}) {
  const service = new LibraryService(now);
  const app = express();
  app.use(express.json());

  const books = Router();
  books.post("/", (req, res) => {
    const book = service.createBook(parse(bookSchema, req.body));
    res.status(201).location(`/books/${book.id}`).json(book);
  });
  books.get("/", (req, res) => {
    const { page, limit, ...filters } = parse(listSchema, req.query);
    const all = service.listBooks(filters);
    const data = all.slice((page - 1) * limit, page * limit);
    res.json({ data, meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) } });
  });
  books.get("/:id", (req, res) => {
    res.json(service.getBook(parse(idSchema, req.params.id)));
  });
  books.post("/:id/loans", (req, res) => {
    const { member } = parse(loanSchema, req.body);
    res.status(201).json(service.lend(parse(idSchema, req.params.id), member));
  });

  const loans = Router();
  loans.get("/overdue", (req, res) => {
    res.json(service.overdue());
  });
  loans.post("/:id/return", (req, res) => {
    res.json(service.returnLoan(parse(idSchema, req.params.id)));
  });

  app.use("/books", books);
  app.use("/loans", loans);
  app.use((req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "לא נמצא" } });
  });
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      const { details } = err as HttpError & { details?: unknown };
      res.status(err.status).json({ error: { code: err.code, message: err.message, ...(details ? { details } : {}) } });
      return;
    }
    if (typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed") {
      res.status(400).json({ error: { code: "INVALID_JSON", message: "JSON לא תקין" } });
      return;
    }
    console.error(err);
    res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  });
  return app;
}
