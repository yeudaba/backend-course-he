// P12-E39: יומן ציונים
export class Gradebook {
  #grades = new Map<string, number[]>();

  add(student: string, grade: number): void {
    const name = student.trim();
    if (name === "") throw new Error("שם ריק");
    if (!Number.isInteger(grade) || grade < 0 || grade > 100) throw new RangeError(`ציון לא תקין: ${grade}`);
    const list = this.#grades.get(name) ?? [];
    list.push(grade);
    this.#grades.set(name, list);
  }

  average(student: string): number {
    const list = this.#grades.get(student.trim());
    if (!list || list.length === 0) throw new Error(`אין ציונים ל־${student}`);
    const avg = list.reduce((s, g) => s + g, 0) / list.length;
    return Math.round(avg * 10) / 10;
  }

  top(n: number): { student: string; average: number }[] {
    return [...this.#grades.keys()]
      .map((student) => ({ student, average: this.average(student) }))
      .sort((a, b) => b.average - a.average || a.student.localeCompare(b.student))
      .slice(0, n);
  }

  get students(): number {
    return this.#grades.size;
  }
}

const book = new Gradebook();
book.add("דנה", 90);
book.add("דנה", 85);
book.add("עומר", 95);
book.add(" נועה ", 70);
console.log(book.average("דנה"), book.students);
console.log(book.top(2));
