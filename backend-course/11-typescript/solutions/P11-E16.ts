// P11-E16
export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function unreachable(x: never): never {
  throw new Error(`צורה לא מוכרת: ${JSON.stringify(x)}`);
}

export function area(shape: Shape): number {
  let a: number;
  switch (shape.kind) {
    case "circle":
      a = Math.PI * shape.radius ** 2;
      break;
    case "rect":
      a = shape.width * shape.height;
      break;
    case "triangle":
      a = (shape.base * shape.height) / 2;
      break;
    default:
      return unreachable(shape);
  }
  return Math.round(a * 100) / 100;
}

export function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return `עיגול ברדיוס ${shape.radius}`;
    case "rect":
      return `מלבן ${shape.width}×${shape.height}`;
    case "triangle":
      return `משולש בסיס ${shape.base} גובה ${shape.height}`;
    default:
      return unreachable(shape);
  }
}

console.log(area({ kind: "circle", radius: 2 }), describe({ kind: "rect", width: 3, height: 4 }));
