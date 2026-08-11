import type { Clock } from '@emme/kernel';

export class FixedClock implements Clock {
  public constructor(private readonly instant: Date) {}

  public now(): Date {
    return this.instant;
  }
}
