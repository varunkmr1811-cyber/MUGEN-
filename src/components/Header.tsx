import React from 'react';
import { 
  Flame, 
  Trophy, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Trash2,
  Download, 
  Upload,
  Plus, 
  CalendarDays
} from 'lucide-react';

import { MONTH_NAMES } from '../utils/dateUtils';

interface HeaderProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onOpenAddModal: () => void;
  onOpenAchievementsModal: () => void;
  onResetZero: () => void;
  onResetDemo: () => void;
  onExport: () => void;
  onImport: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  xp: number;
  level: number;
  streakDays: number;
  onJumpToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  onOpenAddModal,
  onOpenAchievementsModal,
  onResetZero,
  onResetDemo,
  onExport,
  onImport,
  soundEnabled,
  onToggleSound,
  xp,
  level,
  streakDays,
  onJumpToday
}) => {
  const currentXpInLevel = xp % 500;
  const xpNeededForNext = 500;
  const xpProgressPercent = Math.min(100, Math.round((currentXpInLevel / xpNeededForNext) * 100));

  const years = [2024, 2025, 2026, 2027, 2028];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-6 py-3 shadow-xl">
      <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Gamification Bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full xl:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black border border-slate-800/80 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center overflow-hidden group">
              <img 
                src="./logo.png" 
                alt="MUGEN" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-sky-100 to-cyan-300 bg-clip-text text-transparent font-heading">
                  MUGEN
                </span>
                <span className="text-[10px] font-mono-numbers uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60 font-bold">
                  無限 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Infinite Discipline &amp; Habit Analytics</p>
            </div>
          </div>


          <div className="hidden md:block h-7 w-[1px] bg-slate-800" />

          {/* Gamified Level & XP Pill */}
          <div 
            onClick={onOpenAchievementsModal}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all hover:bg-slate-800/50 group shadow-md"
            title="Click to view all trophies & progression"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-black font-mono-numbers">
              L{level}
            </div>
            <div className="flex flex-col min-w-[95px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors font-heading">
                  Habit Master
                </span>
                <span className="font-mono-numbers text-[10px] text-slate-400">{currentXpInLevel}/{xpNeededForNext} XP</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak Badge */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/50 to-amber-950/40 border border-rose-900/60 text-rose-300 shadow-md"
            title="Current active streak of days with completed habits"
          >
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" style={{ animationDuration: '2.5s' }} />
            <div className="text-xs">
              <span className="font-mono-numbers font-black text-white text-sm">{streakDays}</span>
              <span className="text-[11px] text-rose-300 ml-1 font-semibold">Day Streak</span>
            </div>
          </div>

          {/* Achievements Trophy Button */}
          <button
            onClick={onOpenAchievementsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all shadow-md"
            title="View Badges & Trophies"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-heading">Badges</span>
          </button>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto justify-between xl:justify-end">
          
          {/* Year & Month Dropdowns */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1 shadow-inner">
            <CalendarDays className="w-4 h-4 text-sky-400 ml-1.5 mr-0.5" />
            
            {/* Month Dropdown */}
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none focus:bg-slate-800 hover:text-sky-300 cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-slate-900 text-slate-200 font-sans">
                  {name}
                </option>
              ))}
            </select>

            <span className="text-slate-600">/</span>

            {/* Year Dropdown */}
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none focus:bg-slate-800 hover:text-sky-300 cursor-pointer font-mono-numbers"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-slate-200 font-mono-numbers">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Jump to Today Button */}
          <button
            onClick={onJumpToday}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold font-heading transition-all shadow-md"
            title="Jump to current real-world month and day"
          >
            Today
          </button>

          {/* Audio toggle with tactile ASMR sound */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 shadow-md shadow-sky-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'ASMR Sound Effects Active (Click to Mute)' : 'Sounds Muted (Click to Enable)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset All Data to Zero (Start from 0) */}
          <button
            onClick={onResetZero}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-rose-200 text-xs font-bold font-heading transition-all shadow-md group"
            title="Wipe everything & start clean from 0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Start from 0</span>
          </button>

          {/* Demo reset button */}
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-sky-300 transition-all shadow-md text-xs font-heading font-medium"
            title="Load Rich Demo Mock Data (Includes checkmarks & sample habits)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Demo</span>
          </button>

          {/* Export button */}
          <button
            onClick={onExport}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all shadow-md"
            title="Export JSON Data Backup"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import button */}
          <button
            onClick={onImport}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all shadow-md"
            title="Import JSON Data Backup"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Add Habit Primary CTA */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all font-heading"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Habit</span>
          </button>
        </div>

      </div>
    </header>
  );
};
