// P15-E16 — השלם את UsersService, createUsersRouter ו־createApp
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

// list() | get(id) → 404 USER_NOT_FOUND | create({ name, email }) → 409 EMAIL_TAKEN | remove(id) → 404
export class UsersService {
  // כתוב כאן
}

// GET / | GET /:id | POST / (201, Zod: name 1–50, email) | DELETE /:id (204)
export function createUsersRouter(service: UsersService) {
  const router = Router();
  // כתוב כאן
  return router;
}

// router על /users + error handler ל־HttpError
export function createApp(service = new UsersService(new InMemoryUsersRepository())) {
  const app = express();
  // כתוב כאן
  return app;
}
