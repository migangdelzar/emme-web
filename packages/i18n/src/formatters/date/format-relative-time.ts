import { normalizeDate } from '../normalize-date.js';
import type { FormatContext } from '../formatters.types.js';

type RelativeUnit = Intl.RelativeTimeFormatUnit;

const units: readonly [RelativeUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

export function formatRelativeTime(
  value: Date | string | number,
  context: FormatContext,
  now: Date = new Date(),
): string {
  const differenceInSeconds = (normalizeDate(value).getTime() - now.getTime()) / 1000;
  const absoluteDifference = Math.abs(differenceInSeconds);
  const [unit, unitSeconds] = units.find(([, seconds]) => absoluteDifference >= seconds) ?? units.at(-1)!;
  const roundedValue = Math.round(differenceInSeconds / unitSeconds);

  return new Intl.RelativeTimeFormat(context.locale, { numeric: 'always' }).format(
    roundedValue,
    unit,
  );
}
