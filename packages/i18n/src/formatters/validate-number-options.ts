export function validateFractionDigits(options: Intl.NumberFormatOptions): void {
  const { minimumFractionDigits, maximumFractionDigits } = options;

  if (
    minimumFractionDigits !== undefined &&
    maximumFractionDigits !== undefined &&
    maximumFractionDigits < minimumFractionDigits
  ) {
    throw new RangeError(
      'maximumFractionDigits must be greater than or equal to minimumFractionDigits.',
    );
  }
}
