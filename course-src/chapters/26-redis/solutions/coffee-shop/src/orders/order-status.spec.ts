import { fromStatuses, nextStatus } from "./order-status";

describe("מכונת המצבים של הזמנה", () => {
  it.each([
    ["pending_payment", "pay", "paid"],
    ["paid", "ship", "shipped"],
    ["pending_payment", "cancel", "cancelled"],
    ["paid", "cancel", "cancelled"],
  ] as const)("%s + %s ← %s", (from, action, to) => {
    expect(nextStatus(from, action)).toBe(to);
  });

  it.each([
    ["paid", "pay"],
    ["cancelled", "pay"],
    ["pending_payment", "ship"],
    ["shipped", "cancel"],
    ["cancelled", "cancel"],
  ] as const)("%s + %s — אסור", (from, action) => {
    expect(nextStatus(from, action)).toBeNull();
  });

  it("fromStatuses", () => {
    expect(fromStatuses("cancel").sort()).toEqual(["paid", "pending_payment"]);
  });
});
