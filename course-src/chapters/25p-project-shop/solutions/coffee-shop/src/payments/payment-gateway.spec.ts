import { FakePaymentGateway, isValidCardNumber } from "./payment-gateway";

describe("isValidCardNumber (Luhn)", () => {
  it.each(["4242424242424242", "4000000000000002", "4000000000009995", "5555555555554444"])("%s — תקין", (card) => {
    expect(isValidCardNumber(card)).toBe(true);
  });
  it.each(["4242424242424241", "1234", "4242-4242-4242-4242", ""])("%s — לא תקין", (card) => {
    expect(isValidCardNumber(card)).toBe(false);
  });
});

describe("FakePaymentGateway", () => {
  const gw = new FakePaymentGateway();
  it("כרטיס רגיל — מצליח", async () => {
    await expect(gw.charge(1000, "4242424242424242")).resolves.toMatchObject({ ok: true, reference: expect.stringMatching(/^pay_/) });
  });
  it("כרטיסי בדיקה — נדחים", async () => {
    await expect(gw.charge(1000, "4000000000000002")).resolves.toMatchObject({ ok: false, reason: "declined" });
    await expect(gw.charge(1000, "4000000000009995")).resolves.toMatchObject({ ok: false, reason: "insufficient_funds" });
  });
});
