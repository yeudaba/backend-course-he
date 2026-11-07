// P11-E16: circle (radius) | rect (width, height) | triangle (base, height) — לפי kind
export type Shape = { kind: string }; // שנה ל־discriminated union

// שטח מעוגל ל־2 ספרות, switch עם default שמשתמש ב־never
export function area(shape: Shape): number {
  // כתוב כאן
}

// "עיגול ברדיוס 2" | "מלבן 3×4" | "משולש בסיס 6 גובה 2"
export function describe(shape: Shape): string {
  // כתוב כאן
}
