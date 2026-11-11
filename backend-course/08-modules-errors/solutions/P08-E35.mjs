export function initials(fullName) {
  return fullName
    .split(" ")
    .filter((w) => w !== "")
    .map((w) => w[0].toUpperCase())
    .join(".");
}

export function greet(name) {
  return `שלום, ${name}!`;
}

export default function formatUser(user) {
  return `${user.name} (${initials(user.name)})`;
}

console.log(formatUser({ name: "dana levi" }));
