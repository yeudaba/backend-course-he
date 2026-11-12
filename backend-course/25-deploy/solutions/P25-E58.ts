// P25-E58: אימות JWT עם שני מפתחות
import { JwtService } from "@nestjs/jwt";

export function createVerifier(secrets: string[]) {
  if (secrets.length === 0 || secrets.some((s) => s.length < 32)) throw new Error("מפתח לא תקין");
  const jwt = new JwtService();
  return async (token: string) => {
    for (const [keyIndex, secret] of secrets.entries()) {
      try {
        const payload = await jwt.verifyAsync<Record<string, unknown>>(token, { secret });
        return { payload, keyIndex };
      } catch (err) {
        // החתימה תואמת אבל פג תוקף — אין טעם לנסות מפתח אחר
        if ((err as Error).name === "TokenExpiredError") throw new Error("TOKEN_EXPIRED");
      }
    }
    throw new Error("INVALID_TOKEN");
  };
}
