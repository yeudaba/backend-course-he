// P11-E24: event bus מוקלד
export type AppEvent =
  | { type: "order.created"; orderId: number; total: number }
  | { type: "order.paid"; orderId: number; amount: number }
  | { type: "user.signedUp"; userId: number; email: string };

type EventOf<T extends AppEvent["type"]> = Extract<AppEvent, { type: T }>;

export function createBus() {
  const handlers = new Map<AppEvent["type"], ((e: AppEvent) => void)[]>();
  const log: AppEvent[] = [];

  function on<T extends AppEvent["type"]>(type: T, handler: (e: EventOf<T>) => void): void {
    const list = handlers.get(type) ?? [];
    list.push((e) => handler(e as EventOf<T>));
    handlers.set(type, list);
  }

  function emit(event: AppEvent): void {
    log.push(event);
    for (const handler of handlers.get(event.type) ?? []) {
      handler(event);
    }
  }

  function history(): AppEvent[] {
    return [...log];
  }

  return { on, emit, history };
}

const bus = createBus();
bus.on("order.paid", (e) => console.log(`הזמנה ${e.orderId} שולמה: ${e.amount}`));
bus.emit({ type: "order.created", orderId: 7, total: 120 });
bus.emit({ type: "order.paid", orderId: 7, amount: 120 });
console.log(bus.history().length);
