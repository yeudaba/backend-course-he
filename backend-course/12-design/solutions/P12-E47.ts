// P12-E47: צורות עם ירושה
export class Shape {
  readonly label: string;
  constructor(label: string) {
    this.label = label;
  }
  area(): number {
    throw new Error("area לא מומשה");
  }
  describe(): string {
    return `${this.label}: ${this.area().toFixed(2)}`;
  }
}

export class Circle extends Shape {
  readonly r: number;
  constructor(r: number) {
    super("עיגול");
    this.r = r;
  }
  area(): number {
    return Math.PI * this.r ** 2;
  }
}

export class Rect extends Shape {
  readonly w: number;
  readonly h: number;
  constructor(w: number, h: number) {
    super(w === h ? "ריבוע" : "מלבן");
    this.w = w;
    this.h = h;
  }
  area(): number {
    return this.w * this.h;
  }
}

export function totalArea(shapes: Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

const shapes = [new Rect(2, 3), new Circle(1), new Rect(2, 2)];
console.log(shapes.map((s) => s.describe()));
console.log(totalArea(shapes).toFixed(2));
