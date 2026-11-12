// P26.3-E40: לפרק כתובת של image (גם ECR)
export function parseImageRef(ref: string) {
  let rest = ref;
  let digest: string | null = null;
  const at = rest.indexOf("@");
  if (at !== -1) {
    digest = rest.slice(at + 1);
    rest = rest.slice(0, at);
  }
  let registry = "docker.io";
  const slash = rest.indexOf("/");
  const first = slash === -1 ? "" : rest.slice(0, slash);
  if (first && (first.includes(".") || first.includes(":") || first === "localhost")) {
    registry = first;
    rest = rest.slice(slash + 1);
  } else if (slash === -1) {
    rest = `library/${rest}`;
  }
  let tag: string | null = null;
  const colon = rest.lastIndexOf(":");
  if (colon > rest.lastIndexOf("/")) {
    tag = rest.slice(colon + 1);
    rest = rest.slice(0, colon);
  }
  return { registry, repository: rest, tag, digest };
}

export function ecrInfo(ref: string) {
  const m = /^(\d{12})\.dkr\.ecr\.([a-z0-9-]+)\.amazonaws\.com$/.exec(parseImageRef(ref).registry);
  return m ? { account: m[1], region: m[2] } : null;
}
