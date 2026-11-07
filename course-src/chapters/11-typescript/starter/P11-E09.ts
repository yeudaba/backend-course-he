// P11-E09: בלי as ובלי !
export type User = {
  firstName?: string;
  nickname?: string;
  address?: { city?: string };
  phones?: string[];
};

// nickname (אם לא ריק) ← firstName ← "אורח"
export function displayName(u: User): string {
  // כתוב כאן
}

// u.address.city או "לא ידוע"
export function cityOf(u: User): string {
  // כתוב כאן
}

// כמה טלפונים (0 אם אין)
export function phoneCount(u: User): number {
  // כתוב כאן
}
