// שעון שהבדיקה שולטת בו — מחליף את CLOCK
export class TestClock {
  constructor(public current = new Date("2026-11-04T10:00:00.000Z")) {}
  now() {
    return this.current;
  }
  set(iso: string) {
    this.current = new Date(iso);
  }
}
