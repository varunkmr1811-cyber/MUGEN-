import React from 'react';
import type { Habit, MoodRating, MonthData, DayCheckStatus } from '../types/habit';
import { MONTH_NAMES } from '../utils/dateUtils';
import { X, Check, Moon, Smile, Edit3, XCircle } from 'lucide-react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  month: number;
  year: number;
  habits: Habit[];
  monthData: MonthData;
  onSetHabitDayStatus: (habitId: string, dayNumber: number, status: DayCheckStatus | 'none') => void;
  onUpdateMood: (dayNumber: number, mood: MoodRating | undefined) => void;
  onUpdateSleep: (dayNumber: number, hours: number | undefined) => void;
  onUpdateNote: (dayNumber: number, note: string) => void;
}

const MOODS: { val: MoodRating; emoji: string; label: string }[] = [
  { val: 5, emoji: '🤩', label: 'Awesome' },
  { val: 4, emoji: '🙂', label: 'Good' },
  { val: 3, emoji: '😐', label: 'Neutral' },
  { val: 2, emoji: '😕', label: 'Low' },
  { val: 1, emoji: '😭', label: 'Rough' }
];

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  month,
  year,
  habits,
  monthData,
  onSetHabitDayStatus,
  onUpdateMood,
  onUpdateSleep,
  onUpdateNote
}) => {
  if (!isOpen) return null;

  const dateObj = new Date(year, month - 1, dayNumber);
  const dayNameFull = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = MONTH_NAMES[month - 1];

  const habitDaysMap = monthData.habitDays || {};
  const legacyCompleted = monthData.completedHabits || {};
  const wellness = monthData.wellness?.[dayNumber] || {};

  const getStatus = (habitId: string): 'completed' | 'cancelled' | 'none' => {
    if (habitDaysMap[habitId]?.[dayNumber]) return habitDaysMap[habitId][dayNumber];
    if (legacyCompleted[habitId]?.includes(dayNumber)) return 'completed';
    return 'none';
  };

  let completedCount = 0;
  let cancelledCount = 0;
  habits.forEach((h) => {
    const st = getStatus(h.id);
    if (st === 'completed') completedCount++;
    else if (st === 'cancelled') cancelledCount++;
  });
  const percent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex flex-col items-center justify-center text-sky-400 font-mono-numbers">
              <span className="text-[10px] uppercase font-bold leading-none">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-lg font-black leading-none mt-0.5">{dayNumber}</span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 font-heading">
                {dayNameFull}, {monthName} {dayNumber}, {year}
              </h3>
              <p className="text-xs text-slate-400">
                {completedCount} Done (✓) • {cancelledCount} Cancelled (✕) • {percent}% completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[480px] overflow-y-auto">
          
          {/* Habits Checklist for this Day */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-heading">
                Habit Actions for Day {dayNumber}
              </h4>
              <span className="text-xs text-sky-400 font-mono-numbers font-bold">
                {percent}% Score
              </span>
            </div>

            <div className="space-y-2">
              {habits.map((habit) => {
                const status = getStatus(habit.id);
                return (
                  <div
                    key={habit.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-white'
                        : status === 'cancelled'
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{habit.icon}</span>
                      <div>
                        <span className="text-xs font-semibold block text-slate-200">{habit.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{habit.category}</span>
                      </div>
                    </div>

                    {/* Actions: Complete, Cancel, Clear */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSetHabitDayStatus(habit.id, dayNumber, status === 'completed' ? 'none' : 'completed')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                          status === 'completed'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 hover:bg-emerald-950 hover:text-emerald-400 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>✓ Done</span>
                      </button>

                      <button
                        onClick={() => onSetHabitDayStatus(habit.id, dayNumber, status === 'cancelled' ? 'none' : 'cancelled')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                          status === 'cancelled'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>✕ Cancel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wellness Controls: Mood & Sleep */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            {/* Mood selector */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-2 font-heading">
                <Smile className="w-4 h-4" />
                <span>Daily Mood</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                {MOODS.map((m) => (
                  <button
                    key={m.val}
                    onClick={() => onUpdateMood(dayNumber, wellness.mood === m.val ? undefined : m.val)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform hover:scale-125 ${
                      wellness.mood === m.val ? 'bg-amber-500/20 ring-1 ring-amber-400 scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep input */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold mb-2 font-heading">
                <Moon className="w-4 h-4" />
                <span>Sleep Duration</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={wellness.sleepHours !== undefined ? wellness.sleepHours : ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    onUpdateSleep(dayNumber, val);
                  }}
                  placeholder="e.g. 8.0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono-numbers text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <span className="text-xs text-slate-400 font-mono-numbers">hours</span>
              </div>
            </div>
          </div>

          {/* Daily Note / Journal */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-heading">
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Daily Reflection</span>
            </div>
            <textarea
              rows={2}
              value={wellness.note || ''}
              onChange={(e) => onUpdateNote(dayNumber, e.target.value)}
              placeholder="What went well today? Any blockers or wins?"
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
