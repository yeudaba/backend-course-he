// P24-E17: Token Bucket
export interface TakeResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class TokenBucket {
  constructor({ capacity, refillPerSecond, now = () => Date.now() }: { capacity: number; refillPerSecond: number; now?: () => number }) {
    // כתוב כאן
  }

  take(cost = 1): TakeResult {
    return { allowed: true, remaining: 0, retryAfterSeconds: 0 }; // כתוב כאן
  }
}
