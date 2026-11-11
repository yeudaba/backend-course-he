// P11-E68: פקודות CLI כ־union
export type Command =
  | { kind: "add"; name: string; amount: number }
  | { kind: "list" }
  | { kind: "remove"; id: number }
  | { kind: "error"; message: string };

const error = (message: string): Command => ({ kind: "error", message });

export function parseCommand(line: string): Command {
  const [cmd, ...args] = line.trim().split(" ").filter((w) => w !== "");
  switch (cmd) {
    case "add": {
      if (args.length !== 2) return error("שימוש: add <name> <amount>");
      const amount = Number(args[1]);
      if (!Number.isFinite(amount) || amount <= 0) return error("סכום לא תקין");
      return { kind: "add", name: args[0], amount };
    }
    case "list":
      return args.length === 0 ? { kind: "list" } : error("שימוש: list");
    case "remove": {
      if (args.length !== 1) return error("שימוש: remove <id>");
      const id = Number(args[0]);
      if (!Number.isInteger(id) || id <= 0) return error("מזהה לא תקין");
      return { kind: "remove", id };
    }
    default:
      return error("פקודה לא מוכרת");
  }
}

for (const line of ["add קפה 12.5", "  list ", "remove 0", "add קפה", "fly"]) {
  console.log(JSON.stringify(parseCommand(line)));
}
