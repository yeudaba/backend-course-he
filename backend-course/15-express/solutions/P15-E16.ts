// P15-E16
import express, { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export class InMemoryUsersRepository {
  #users: User[] = [];
  #nextId = 1;
  findAll(): User[] {
    return [...this.#users];
  }
  findById(id: number): User | undefined {
    return this.#users.find((u) => u.id === id);
  }
  findByEmail(email: string): User | undefined {
    return this.#users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  insert(data: Omit<User, "id">): User {
    const user = { id: this.#nextId++, ...data };
    this.#users.push(user);
    return user;
  }
  delete(id: number): boolean {
    const before = this.#users.length;
    this.#users = this.#users.filter((u) => u.id !== id);
    return this.#users.length < before;
  }
}

export class UsersService {
  repo: InMemoryUsersRepository;
  constructor(repo: InMemoryUsersRepository) {
    this.repo = repo;
  }
  list() {
    return this.repo.findAll();
  }
  get(id: number) {
    const user = this.repo.findById(id);
    if (!user) throw new HttpError(404, "USER_NOT_FOUND", "המשתמש לא נמצא");
    return user;
  }
  create(data: { name: string; email: string }) {
    if (this.repo.findByEmail(data.email)) throw new HttpError(409, "EMAIL_TAKEN", "האימייל כבר רשום");
    return this.repo.insert(data);
  }
  remove(id: number) {
    if (!this.repo.delete(id)) throw new HttpError(404, "USER_NOT_FOUND", "המשתמש לא נמצא");
  }
}

const createUserSchema = z.object({ name: z.string().trim().min(1).max(50), email: z.email() });

export function createUsersRouter(service: UsersService) {
  const router = Router();
  router.get("/", (req, res) => {
    res.json(service.list());
  });
  router.get("/:id", (req, res) => {
    res.json(service.get(Number(req.params.id)));
  });
  router.post("/", (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } });
      return;
    }
    const user = service.create(parsed.data);
    res.status(201).location(`/users/${user.id}`).json(user);
  });
  router.delete("/:id", (req, res) => {
    service.remove(Number(req.params.id));
    res.sendStatus(204);
  });
  return router;
}

export function createApp(service = new UsersService(new InMemoryUsersRepository())) {
  const app = express();
  app.use(express.json());
  app.use("/users", createUsersRouter(service));
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    next(err);
  });
  return app;
}
