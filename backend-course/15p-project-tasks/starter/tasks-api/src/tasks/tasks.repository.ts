// שלב 1. שכבת האחסון — בזיכרון. כל המתודות async (בפרק 19 יוחלף ב־PostgreSQL בלי לגעת בשאר הקוד).
import type { Task } from "./tasks.schema.ts";

export interface TasksRepository {
  findAll(): Promise<Task[]>;
  findById(id: number): Promise<Task | undefined>;
  insert(data: Omit<Task, "id">): Promise<Task>;
  update(id: number, changes: Partial<Omit<Task, "id">>): Promise<Task | undefined>;
  delete(id: number): Promise<boolean>;
}

// ids מ־1. מחזירה תמיד עותקים — מי שמשנה את מה שקיבל לא משנה את המאגר.
export class InMemoryTasksRepository implements TasksRepository {
  async findAll(): Promise<Task[]> {
    throw new Error("לא מומש");
  }
  async findById(id: number): Promise<Task | undefined> {
    throw new Error("לא מומש");
  }
  async insert(data: Omit<Task, "id">): Promise<Task> {
    throw new Error("לא מומש");
  }
  async update(id: number, changes: Partial<Omit<Task, "id">>): Promise<Task | undefined> {
    throw new Error("לא מומש");
  }
  async delete(id: number): Promise<boolean> {
    throw new Error("לא מומש");
  }
}
