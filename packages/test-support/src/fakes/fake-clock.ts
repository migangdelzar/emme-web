import type { Clock } from '@emme/kernel';

export class FakeClock implements Clock {
  private instant: Date;

  public constructor(instant: Date = new Date(0)) {
    this.instant = new Date(instant);
  }

  public now(): Date {
    return new Date(this.instant);
  }

  public setNow(instant: Date): void {
    this.instant = new Date(instant);
  }
}
