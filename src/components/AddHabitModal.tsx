import React, { useState, useEffect } from 'react';
import type { Habit, HabitCategory } from '../types/habit';
import { X, Sparkles, Check } from 'lucide-react';


interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => void;
  editingHabit?: Habit | null;
  daysInMonth: number;
}

const POPULAR_EMOJIS = [
  '⏰', '💪', '📖', '🎯', '🚿', '💧', '🧘', '🏃',
  '🥗', '💊', '✍️', '💻', '🧠', '🎨', '🎸', '🧹',
  '🥑', '🚴', '🛌', '☀️', '🪴', '🍎', '🍵', '⚡'
];

const CATEGORIES: HabitCategory[] = [
  'Routine',
  'Fitness',
  'Health',
  'Productivity',
  'Learning',
  'Mindset',
  'Custom'
];

const COLOR_OPTIONS = [
  { name: 'Sky', hex: '#38bdf8' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' }
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit,
  daysInMonth
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💪');
  const [category, setCategory] = useState<HabitCategory>('Fitness');
  const [color, setColor] = useState('#38bdf8');
  const [targetDays, setTargetDays] = useState(25);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setIcon(editingHabit.icon);
      setCategory(editingHabit.category);
      setColor(editingHabit.color);
      setTargetDays(editingHabit.targetDays);
    } else {
      setName('');
      setIcon('💪');
      setCategory('Fitness');
      setColor('#38bdf8');
      setTargetDays(Math.min(25, daysInMonth));
    }
    setError('');
  }, [editingHabit, isOpen, daysInMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit title.');
      return;
    }
    if (targetDays < 1 || targetDays > daysInMonth) {
      setError(`Target days must be between 1 and ${daysInMonth}.`);
      return;
    }

    onSave(
      {
        name: name.trim(),
        icon,
        category,
        color,
        targetDays
      },
      editingHabit ? editingHabit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              <p className="text-xs text-slate-400">Customize icon, target days, and category</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Habit Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl p-2 rounded-lg bg-slate-800 border border-slate-700 select-none">
                {icon}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 20 pages / Morning Run"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoFocus
              />
            </div>
          </div>

          {/* Icon / Emoji Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Emoji Icon
            </label>
            <div className="grid grid-cols-8 gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 max-h-32 overflow-y-auto">
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`h-9 rounded-md flex items-center justify-center text-lg hover:bg-slate-800 transition-transform active:scale-95 ${
                    icon === emoji ? 'bg-sky-500/20 ring-2 ring-sky-400' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Target Days Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Monthly Goal (Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={daysInMonth}
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 text-xs font-mono-numbers text-slate-200 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 font-mono-numbers whitespace-nowrap">
                  / {daysInMonth}d
                </span>
              </div>
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === c.hex ? 'scale-110 ring-2 ring-white' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {color === c.hex && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
