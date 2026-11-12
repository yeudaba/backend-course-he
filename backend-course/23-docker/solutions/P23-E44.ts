// P23-E44: registry/repository:tag@digest
export type ImageRef = { registry: string; repository: string; tag: string | null; digest: string | null };

export function parseImageRef(ref: string): ImageRef {
  const bad = () => new Error(`שם לא תקין: ${ref}`);
  if (ref === "" || /\s/.test(ref)) throw bad();
  const [rest, digest = null] = ref.split("@");
  let name = rest;
  let tag: string | null = null;
  const colon = rest.lastIndexOf(":");
  if (colon !== -1 && !rest.slice(colon).includes("/")) {
    name = rest.slice(0, colon);
    tag = rest.slice(colon + 1);
  }
  if (tag === null && digest === null) tag = "latest";
  const parts = name.split("/");
  let registry = "docker.io";
  if (parts.length > 1 && (/[.:]/.test(parts[0]) || parts[0] === "localhost")) registry = parts.shift()!;
  let repository = parts.join("/");
  if (!repository || /[A-Z]/.test(repository) || tag === "") throw bad();
  if (registry === "docker.io" && !repository.includes("/")) repository = `library/${repository}`;
  return { registry, repository, tag, digest };
}
