// P12-E54: בטל ובצע שוב
export class NothingToUndoError extends Error {
  constructor() {
    super("אין מה לבטל");
    this.name = new.target.name;
  }
}

export class NothingToRedoError extends Error {
  constructor() {
    super("אין מה לבצע שוב");
    this.name = new.target.name;
  }
}

export class History {
  #done: string[] = [];
  #undone: string[] = [];

  push(action: string): void {
    this.#done.push(action);
    this.#undone = [];
  }

  undo(): string {
    const action = this.#done.pop();
    if (action === undefined) throw new NothingToUndoError();
    this.#undone.push(action);
    return action;
  }

  redo(): string {
    const action = this.#undone.pop();
    if (action === undefined) throw new NothingToRedoError();
    this.#done.push(action);
    return action;
  }

  get done(): string[] {
    return [...this.#done];
  }
}

const h = new History();
h.push("כתוב א");
h.push("כתוב ב");
console.log(h.undo(), h.done);
console.log(h.redo(), h.done);
h.undo();
h.push("כתוב ג");
try {
  h.redo();
} catch (err) {
  console.log(String(err), h.done);
}
