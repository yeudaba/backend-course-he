// P26.5-E24: צינור ההזמנות של חנות הקפה ב־RabbitMQ
import type { Channel, ConfirmChannel } from "amqplib";

export interface PipelineNames {
  exchange: string;
  emailQueue: string;
  inventoryQueue: string;
  deadLetterExchange: string;
  deadLetterQueue: string;
}

export interface OrderPlaced {
  eventId: string;
  orderId: number;
  email: string;
  items: { productId: number; quantity: number }[];
}

export interface ProcessedStore {
  markIfNew(consumer: string, eventId: string): Promise<boolean>;
  unmark(consumer: string, eventId: string): Promise<void>;
}

export async function setupOrderPipeline(ch: Channel, n: PipelineNames): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function publishOrderPlaced(ch: ConfirmChannel, exchange: string, e: OrderPlaced): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function memoryStore(): ProcessedStore {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function startConsumer(ch: Channel, queue: string, name: string, store: ProcessedStore, handle: (e: OrderPlaced) => Promise<void>): Promise<string> {
  throw new Error("עוד לא כתבת את הפתרון");
}
