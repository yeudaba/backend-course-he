// P13-E21: מתוקן
export function settings(env) {
  const port = Number(env.PORT ?? 3000);
  return {
    port,
    nextPort: port + 1,
    debug: env.DEBUG?.toLowerCase() === "true",
    maxUploadMb: env.MAX_UPLOAD_MB === undefined ? 10 : Number(env.MAX_UPLOAD_MB),
  };
}

console.log(settings({ PORT: "8080", DEBUG: "false", MAX_UPLOAD_MB: "0" }));
