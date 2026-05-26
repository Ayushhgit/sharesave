import { addDays, addMonths, nextSaturday, setHours, setMinutes, setSeconds } from 'date-fns';
import type { ReminderPreset } from '@/types';

export interface ReminderPresetDef {
  id: ReminderPreset;
  label: string;
  hint: string;
  icon: string;
  resolve: (from?: Date) => Date;
}

const at = (d: Date, h: number, m = 0) => setSeconds(setMinutes(setHours(d, h), m), 0);

export const REMINDER_PRESETS: ReminderPresetDef[] = [
  {
    id: 'tonight',
    label: 'Tonight',
    hint: 'Around 8pm',
    icon: 'Moon',
    resolve: (from = new Date()) => at(from, 20, 0),
  },
  {
    id: 'weekend',
    label: 'Weekend',
    hint: 'Saturday morning',
    icon: 'Coffee',
    resolve: (from = new Date()) => at(nextSaturday(from), 10, 0),
  },
  {
    id: 'next-month',
    label: 'Next month',
    hint: 'Fresh start',
    icon: 'CalendarDays',
    resolve: (from = new Date()) => at(addMonths(from, 1), 9, 0),
  },
  {
    id: 'payday',
    label: 'Payday',
    hint: 'Last Friday',
    icon: 'BadgeDollarSign',
    resolve: (from = new Date()) => at(addDays(from, 14), 12, 0),
  },
  {
    id: 'someday',
    label: 'Someday',
    hint: 'No rush',
    icon: 'Infinity',
    resolve: (from = new Date()) => at(addMonths(from, 6), 10, 0),
  },
];
