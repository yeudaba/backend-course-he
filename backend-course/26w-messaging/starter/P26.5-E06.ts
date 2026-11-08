// P26.5-E06: topic exchange — מי מקבל איזה אירוע
import type { Channel } from "amqplib";

export interface Topology {
  exchange: string;
  emailQueue: string;
  analyticsQueue: string;
}

export interface OrderEvent {
  id: string;
  type: "created" | "paid" | "shipped" | "cancelled";
  orderId: number;
  country: string;
}

export async function setupTopology(ch: Channel, t: Topology): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function publishOrderEvent(ch: Channel, exchange: string, e: OrderEvent): boolean {
  throw new Error("עוד לא כתבת את הפתרון");
}
