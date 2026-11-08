// P25-E21: שלוש תקלות בהגדרות. בפיתוח הכול עבד. מצא ותקן
export function loadConfig(env: Record<string, string | undefined>) {
  return {
    production: env.NODE_ENV === "production",
    jwtSecret: env.JWT_SECRET ?? "dev-secret",
    debug: env.DEBUG === true,
    corsOrigins: (env.CORS_ORIGINS ?? "http://localhost:5500").split(","),
  };
}
