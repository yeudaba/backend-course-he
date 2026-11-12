// P22-E72: createSpy — jest.fn בקטן
export type Spy = ((...args: any[]) => any) & {
  calls: any[][];
  results: any[];
  readonly callCount: number;
  mockReturnValueOnce(value: any): Spy;
  mockImplementation(fn: (...args: any[]) => any): Spy;
  reset(): void;
};

export function createSpy(impl?: (...args: any[]) => any): Spy {
  let current = impl;
  const once: any[] = [];
  const spy = ((...args: any[]) => {
    spy.calls.push(args);
    const value = once.length > 0 ? once.shift() : current?.(...args);
    spy.results.push(value);
    return value;
  }) as Spy;
  spy.calls = [];
  spy.results = [];
  Object.defineProperty(spy, "callCount", { get: () => spy.calls.length });
  spy.mockReturnValueOnce = (value) => {
    once.push(value);
    return spy;
  };
  spy.mockImplementation = (fn) => {
    current = fn;
    return spy;
  };
  spy.reset = () => {
    spy.calls = [];
    spy.results = [];
    once.length = 0;
  };
  return spy;
}
