import { AsyncLocalStorage } from "node:async_hooks";

// "הבקשה הנוכחית" — זמין מכל מקום בקוד (service, repository, logger) בלי להעביר פרמטר.
// AsyncLocalStorage עוקב אחרי ההקשר גם דרך await ו־setTimeout.
export interface RequestContext {
  requestId: string;
  userId?: number;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const currentRequest = (): RequestContext | undefined => requestContext.getStore();
