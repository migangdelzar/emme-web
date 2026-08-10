import type { ChangeEvent, ReactNode } from 'react';

export interface DatePickerProps {
  readonly id?: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
}

export function DatePicker({ id = 'date-picker', label, value, onChange, disabled }: DatePickerProps): ReactNode {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.currentTarget.value);
  };

  return (
    <div data-slot="date-picker">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="date" value={value} onChange={handleChange} disabled={disabled} />
    </div>
  );
}
