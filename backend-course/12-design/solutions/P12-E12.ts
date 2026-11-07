// P12-E12
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export type CreateUserDto = { email: string; name: string; age?: number };

export function parseCreateUser(input: unknown): CreateUserDto {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("body", "חייב להיות אובייקט");
  }
  const { email, name, age } = input as Record<string, unknown>;
  if (typeof email !== "string" || !email.includes("@")) {
    throw new ValidationError("email", "אימייל לא תקין");
  }
  if (typeof name !== "string" || name.trim() === "") {
    throw new ValidationError("name", "שם חובה");
  }
  if (age !== undefined && (typeof age !== "number" || !Number.isInteger(age) || age < 13 || age > 120)) {
    throw new ValidationError("age", "גיל לא תקין");
  }
  const dto: CreateUserDto = { email: email.trim().toLowerCase(), name: name.trim() };
  if (age !== undefined) {
    dto.age = age;
  }
  return dto;
}

console.log(parseCreateUser({ email: " Dana@X.com ", name: " דנה ", role: "admin" }));
