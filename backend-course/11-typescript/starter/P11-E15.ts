// P11-E15: pending → paid → shipped → delivered; מ־pending/paid אפשר גם cancelled
export type OrderStatus = string; // שנה ל־literal types
export type Order = { id: number; status: OrderStatus };

export function allowedNext(status: OrderStatus): OrderStatus[] {
  // כתוב כאן
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  // כתוב כאן
}

// עותק עם הסטטוס החדש, או throw Error(`לא ניתן לעבור מ־${from} ל־${to}`)
export function transition(order: Order, to: OrderStatus): Order {
  // כתוב כאן
}
