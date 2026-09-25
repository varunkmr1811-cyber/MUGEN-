import React from 'react';
import { MONTH_SHORT_NAMES } from '../utils/dateUtils';
import type { MonthData } from '../types/habit';

interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  onSelectMonth: (month: number) => void;
  allMonthsData: Record<string, MonthData>;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonth,
  currentYear,
  onSelectMonth,
  allMonthsData
}) => {
  return (
    <nav 
      aria-label="Monthly navigation tabs"
      className="sticky bottom-0 z-30 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 sm:px-4 py-2.5 shadow-2xl"
    >
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {MONTH_SHORT_NAMES.map((name, idx) => {
          const monthNum = idx + 1;
          const isActive = currentMonth === monthNum;
          const monthKey = `${currentYear}-${monthNum < 10 ? `0${monthNum}` : monthNum}`;
          const monthData = allMonthsData[monthKey];
          
          let totalDone = 0;
          let totalSkip = 0;

          if (monthData?.habitDays) {
            Object.values(monthData.habitDays).forEach((dayMap) => {
              Object.values(dayMap).forEach((st) => {
                if (st === 'completed') totalDone++;
                else if (st === 'cancelled') totalSkip++;
              });
            });
          } else if (monthData?.completedHabits) {
            Object.values(monthData.completedHabits).forEach((days) => {
              totalDone += days.length;
            });
          }

          const hasData = totalDone > 0 || totalSkip > 0;

          return (
            <button
              key={name}
              id={`month-tab-${name.toLowerCase()}`}
              onClick={() => onSelectMonth(monthNum)}
              className={`flex-1 min-w-[60px] sm:min-w-[76px] py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative group ${
                isActive
                  ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/15 text-white font-bold ring-1 ring-sky-500/50'
                  : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top accent pill */}
              {isActive && (
                <div className="absolute -top-[11px] w-8 h-1 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 shadow-sm shadow-sky-400" />
              )}

              <span className={`text-xs uppercase tracking-wider font-heading ${isActive ? 'text-sky-300 font-black' : 'font-bold'}`}>
                {name}
              </span>

              <div className="flex items-center gap-1 mt-0.5">
                {hasData ? (
                  <div className="flex items-center gap-1 text-[10px] font-mono-numbers">
                    <span className={isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {totalDone}✓
                    </span>
                    {totalSkip > 0 && (
                      <span className="text-rose-400/90 text-[9px]">
                        {totalSkip}✕
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-mono-numbers text-slate-600">—</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
