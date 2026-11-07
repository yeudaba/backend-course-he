// P13-E21: שלושה באגים. settings({ PORT: "8080", DEBUG: "false", MAX_UPLOAD_MB: "0" })
// צריך: { port: 8080, nextPort: 8081, debug: false, maxUploadMb: 0 } | MAX_UPLOAD_MB חסר → 10 | PORT חסר → 3000
export function settings(env) {
  const port = env.PORT || 3000;
  return {
    port,
    nextPort: port + 1,
    debug: Boolean(env.DEBUG),
    maxUploadMb: Number(env.MAX_UPLOAD_MB) || 10,
  };
}
