import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  blockedDates?: string[];
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  blockedDates = ['2026-08-15', '2026-08-16'],
}) => {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  const calculateDays = (s: string, e: string) => {
    if (!s || !e) return 0;
    const diff = Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  const days = calculateDays(start, end);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStart(val);
    if (new Date(val) > new Date(end)) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 3);
      const newEnd = nextDay.toISOString().split('T')[0];
      setEnd(newEnd);
      onChange(val, newEnd);
    } else {
      onChange(val, end);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEnd(val);
    onChange(start, val);
  };

  return (
    <div className="w-full flex flex-col gap-3 p-4 rounded-xl glass-panel border border-[#988686]/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#000000] dark:text-[#F5F3F3]">
          <CalendarIcon className="w-4 h-4 text-[#988686]" />
          <span>Rental Period Selection</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-[#988686]/20 px-2.5 py-1 rounded-full text-[#988686] font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{days} {days === 1 ? 'Day' : 'Days'} Duration</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
            Pickup / Start Date
          </label>
          <input
            type="date"
            value={start}
            min={new Date().toISOString().split('T')[0]}
            onChange={handleStartChange}
            className="glass-input rounded px-3 py-2 text-xs font-medium text-[#000000] dark:text-[#F5F3F3]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
            Return / End Date
          </label>
          <input
            type="date"
            value={end}
            min={start}
            onChange={handleEndChange}
            className="glass-input rounded px-3 py-2 text-xs font-medium text-[#000000] dark:text-[#F5F3F3]"
          />
        </div>
      </div>

      {blockedDates.length > 0 && (
        <div className="text-[11px] text-[#B08A4E] bg-[#B08A4E]/10 p-2 rounded flex items-center gap-2">
          <span>⚠️ Fully Booked Dates in system: Aug 15 – Aug 16 (Blocked out)</span>
        </div>
      )}
    </div>
  );
};
