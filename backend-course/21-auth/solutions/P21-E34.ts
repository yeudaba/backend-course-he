// P21-E34: normalizeEmail
export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (email.length > 254 || /\s/.test(email)) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (local === "" || !domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return null;
  return email;
}
