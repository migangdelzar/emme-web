import React, { useState, useEffect } from 'react';
import { Input } from '../Input/index.js';
import { cn } from '../../lib/utils.js';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  inputClassName?: string;
}

export function PhoneInput({ value, onChange, className, id, inputClassName }: PhoneInputProps) {
  const [lada, setLada] = useState('+52');
  const [number, setNumber] = useState('');

  // Sincronizar estado interno con el valor externo
  useEffect(() => {
    if (value) {
      if (value.includes(' ')) {
        const parts = value.split(' ');
        setLada(parts[0] || '+52');
        setNumber(parts.slice(1).join('').replace(/\D/g, '').slice(0, 10));
      } else if (value.startsWith('+')) {
        // Fallback for values like +521234567890 without space
        setLada(value.slice(0, 3));
        setNumber(value.slice(3).replace(/\D/g, '').slice(0, 10));
      } else {
        setLada('+52');
        setNumber(value.replace(/\D/g, '').slice(0, 10));
      }
    } else {
      setLada('+52');
      setNumber('');
    }
  }, [value]);

  const updateParent = (newLada: string, newNumber: string) => {
    onChange(`${newLada} ${newNumber}`);
  };

  const handleLadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val && !val.startsWith('+')) val = '+' + val;
    setLada(val);
    updateParent(val, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setNumber(val);
    updateParent(lada, val);
  };

  return (
    <div className={cn('flex items-center gap-2 w-full h-18', className)} id={id}>
      <div className="flex flex-col gap-1.5 w-[85px] h-full shrink-0">
        <label
          htmlFor={`${id}-lada`}
          className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2"
        >
          LADA
        </label>
        <Input
          id={`${id}-lada`}
          value={lada}
          onChange={handleLadaChange}
          className={cn(
            'text-center font-display font-black text-sm bg-neutral-100 border-none rounded-2xl h-full shadow-inner focus:ring-4 focus:ring-primary/10 transition-all px-1',
            inputClassName
          )}
          placeholder="+52"
        />
      </div>
      <div className="flex flex-col gap-1.5 flex-1 h-full">
        <label
          htmlFor={`${id}-number`}
          className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-4"
        >
          Teléfono (10 dígs)
        </label>
        <Input
          id={`${id}-number`}
          value={number}
          onChange={handleNumberChange}
          className={cn(
            'font-display font-bold text-lg bg-neutral-100 border-none rounded-2xl h-full shadow-inner focus:ring-4 focus:ring-primary/10 transition-all px-4',
            inputClassName
          )}
          placeholder="55 1234 5678"
          maxLength={10}
          type="tel"
        />
      </div>
    </div>
  );
}
