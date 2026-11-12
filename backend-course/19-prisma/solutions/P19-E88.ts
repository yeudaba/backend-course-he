// P19-E88: router שמקבל repository
import express from "express";
import { z } from "zod";

type Customer = { id: number; fullName: string; email: string; city: string | null };
interface CustomersRepository {
  findById(id: number): Promise<Customer | undefined>;
  findByEmail(email: string): Promise<Customer | undefined>;
  insert(data: Omit<Customer, "id">): Promise<Customer>;
  delete(id: number): Promise<boolean>;
}

const CreateCustomer = z.object({
  fullName: z.string().trim().min(1),
  email: z.email().transform((e) => e.toLowerCase()),
  city: z.string().nullable().default(null),
});

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

export function createApp(repo: CustomersRepository) {
  const app = express();
  app.use(express.json());

  app.get("/customers/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "VALIDATION" });
    const c = await repo.findById(id);
    if (!c) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(c);
  });

  app.post("/customers", async (req, res) => {
    const parsed = CreateCustomer.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "VALIDATION" });
    res.status(201).json(await repo.insert(parsed.data));
  });

  app.delete("/customers/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === undefined) return res.status(400).json({ error: "VALIDATION" });
    if (!(await repo.delete(id))) return res.status(404).json({ error: "NOT_FOUND" });
    res.status(204).end();
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err?.code === "EMAIL_TAKEN") return res.status(409).json({ error: "EMAIL_TAKEN" });
    res.status(500).json({ error: "INTERNAL" });
  });
  return app;
}
