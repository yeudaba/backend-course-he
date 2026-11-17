// P23-E45: RunSpec ← ארגומנטים של docker run
export type RunSpec = {
  image: string;
  name?: string;
  detach?: boolean;
  rm?: boolean;
  restart?: "no" | "always" | "unless-stopped";
  env?: Record<string, string>;
  ports?: string[];
  volumes?: string[];
  command?: string[];
};

export function runArgs(spec: RunSpec): string[] {
  const last = spec.image.split("/").at(-1)!;
  if (!last.includes(":") && !spec.image.includes("@")) throw new Error(`צריך tag מפורש: ${spec.image}`);
  if (spec.rm && spec.restart && spec.restart !== "no") throw new Error("--rm ו־--restart לא הולכים יחד");
  const args = ["run"];
  if (spec.detach) args.push("-d");
  if (spec.rm) args.push("--rm");
  if (spec.name) args.push("--name", spec.name);
  if (spec.restart) args.push("--restart", spec.restart);
  for (const [k, v] of Object.entries(spec.env ?? {})) args.push("-e", `${k}=${v}`);
  for (const p of spec.ports ?? []) args.push("-p", p);
  for (const v of spec.volumes ?? []) args.push("-v", v);
  args.push(spec.image, ...(spec.command ?? []));
  return args;
}
