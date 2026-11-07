// נטען עם --import כשהבודק רוצה "להזיז את השעון של המחשב": FAKE_NOW=2026-12-31T23:30:00Z
// new Date() ו־Date.now() מחזירים את הזמן הזה; new Date(x) עובד כרגיל.
const fixed = Date.parse(process.env.FAKE_NOW);
if (!Number.isNaN(fixed)) {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(fixed);
      else super(...args);
    }
    static now() {
      return fixed;
    }
  }
  globalThis.Date = FakeDate;
}
