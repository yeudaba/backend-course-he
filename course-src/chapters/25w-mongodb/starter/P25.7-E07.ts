// P25.7-E07: לקוח חדש, ואימייל ייחודי
import { MongoServerError, type Db } from "mongodb";

export class DuplicateEmailError extends Error {}

export async function setupCustomers(db: Db) {
  // כתוב כאן
}

export async function createCustomer(db: Db, { name, email, city }: { name: string; email: string; city: string }) {
  // כתוב כאן
}
