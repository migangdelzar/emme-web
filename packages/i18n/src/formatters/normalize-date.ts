export function normalizeDate(value: Date | string): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date value.');
  }

  return date;
}
