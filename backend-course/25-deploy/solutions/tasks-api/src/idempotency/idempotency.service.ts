import { createHash } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { CLOCK, CONFIG, type AppConfig, type Clock } from "../config";
import { HttpError } from "../errors";
import { IDEMPOTENCY_REPOSITORY, type IdempotencyRepository } from "./idempotency.repository";

const VALID_KEY = /^[A-Za-z0-9_-]{8,100}$/;

@Injectable()
export class IdempotencyService {
  constructor(
    @Inject(IDEMPOTENCY_REPOSITORY) private readonly repo: IdempotencyRepository,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  // מריץ את action פעם אחת לכל (משתמש, מפתח). בקשה חוזרת זהה ← אותה תשובה, בלי לבצע שוב
  async run<T>(userId: number, key: string, payload: unknown, action: () => Promise<T>): Promise<{ replayed: boolean; body: T }> {
    if (!VALID_KEY.test(key)) {
      throw new HttpError(400, "VALIDATION_ERROR", "Idempotency-Key: 8–100 תווים, אותיות, ספרות, - ו־_");
    }
    // "טביעת אצבע" של הבקשה — כדי לזהות שימוש חוזר במפתח עם תוכן אחר
    const fingerprint = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const r = await this.repo.reserve(userId, key, fingerprint, this.clock.now(), this.config.idempotencyTtlHours);
    if (r.kind === "mismatch") throw new HttpError(422, "IDEMPOTENCY_KEY_REUSED", "המפתח כבר שימש לבקשה עם תוכן אחר");
    if (r.kind === "in_progress") throw new HttpError(409, "IDEMPOTENCY_IN_PROGRESS", "בקשה עם המפתח הזה עדיין בטיפול");
    if (r.kind === "replay") return { replayed: true, body: r.body as T };
    try {
      const body = await action();
      await this.repo.complete(userId, key, 201, body);
      return { replayed: false, body };
    } catch (err) {
      // נכשל (למשל 422 על תאריך) — משחררים את המפתח, כדי שאפשר יהיה לתקן ולנסות שוב
      await this.repo.release(userId, key);
      throw err;
    }
  }
}
