// P26.3-E95: להסתיר סודות בלוג
export function maskSecrets(log: string, secrets: string[]) {
  return [...secrets]
    .filter((s) => s.length > 0)
    .sort((a, b) => b.length - a.length)
    .reduce((text, s) => text.split(s).join("****"), log);
}
