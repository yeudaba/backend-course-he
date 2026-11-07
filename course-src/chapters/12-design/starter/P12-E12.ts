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

// email: trim + lowercase, חייב @ ("אימייל לא תקין") | name: trim, לא ריק ("שם חובה")
// age: אם קיים — שלם 13–120 ("גיל לא תקין") | לא אובייקט → field "body", "חייב להיות אובייקט"
// שדות אחרים — לא בתוצאה
export function parseCreateUser(input: unknown): CreateUserDto {
  // כתוב כאן
}
