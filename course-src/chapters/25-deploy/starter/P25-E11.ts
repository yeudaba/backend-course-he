// P25-E11: DATABASE_URL — להציג בלי לחשוף
export function redactDatabaseUrl(url: string): string {
  return url; // כתוב כאן
}

export function describeDb(url: string) {
  return { host: "", port: 0, database: "", user: "", ssl: false }; // כתוב כאן
}
