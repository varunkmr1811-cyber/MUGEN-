import React from 'react';
import type { Habit, HabitStat, MonthData, DayCheckStatus } from '../types/habit';
import type { MonthAnalytics } from '../utils/statsUtils';
import { Check, X, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';

interface HabitMatrixProps {
  habits: Habit[];
  analytics: MonthAnalytics;
  monthData: MonthData;
  onCycleHabitDay: (habitId: string, dayNumber: number) => void;
  onSetHabitDayStatus: (habitId: string, dayNumber: number, status: DayCheckStatus | 'none') => void;
  onDeleteHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onOpenAddModal: () => void;
  selectedDay?: number | null;
  onSelectDay?: (dayNumber: number) => void;
}

export const HabitMatrix: React.FC<HabitMatrixProps> = ({
  habits,
  analytics,
  monthData,
  onCycleHabitDay,
  onSetHabitDayStatus,
  onDeleteHabit,
  onEditHabit,
  onOpenAddModal,
  selectedDay,
  onSelectDay
}) => {
  const { days, weekGroups, habitStats, dayMetrics } = analytics;
  const habitDaysMap = monthData.habitDays || {};
  const legacyCompleted = monthData.completedHabits || {};

  const statsMap = new Map<string, HabitStat>();
  habitStats.forEach((s) => statsMap.set(s.habitId, s));

  const getDayStatus = (habitId: string, dayNumber: number): 'completed' | 'cancelled' | 'none' => {
    if (habitDaysMap[habitId]?.[dayNumber]) {
      return habitDaysMap[habitId][dayNumber];
    }
    if (legacyCompleted[habitId]?.includes(dayNumber)) {
      return 'completed';
    }
    return 'none';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
      
      {/* Matrix Controls & Instructions Banner */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-slate-100 font-heading">
            Habit Execution Matrix
          </span>
          <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 font-semibold">
            {habits.length} Habits Active
          </span>
        </div>

        {/* Legend for 3-way toggle ticks */}
        <div className="flex items-center gap-3 text-[11px] font-mono-numbers">
          <span className="text-slate-400 text-[10px] hidden sm:inline">Click cell to cycle:</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">✓</span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[9px]">✕</span>
            <span>Cancel Tick</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700 text-slate-400">
            <span className="w-3.5 h-3.5 rounded border border-slate-600 bg-slate-900 flex items-center justify-center text-[9px]">·</span>
            <span>Empty</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Table */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse select-none min-w-[1240px]">
          
          {/* Table Head */}
          <thead>
            {/* Row 1: High Level Groupings */}
            <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              
              {/* Sticky Left: Habit Column */}
              <th className="sticky left-0 z-20 bg-slate-950 px-4 py-2.5 w-[290px] min-w-[290px] border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-extrabold text-xs font-heading">
                    Habits &amp; Daily Goals
                  </span>
                  <button
                    onClick={onOpenAddModal}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>New</span>
                  </button>
                </div>
              </th>

              {/* Center: Week Header Groupings */}
              {weekGroups.map((group) => (
                <th
                  key={group.weekNumber}
                  colSpan={group.days.length}
                  className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-950/60"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sky-400 font-extrabold text-xs font-mono-numbers">
                      Week {group.weekNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({group.days.length} days)
                    </span>
                  </div>
                </th>
              ))}

              {/* Right: Habit Analysis Header */}
              <th className="px-4 py-2.5 bg-slate-950 border-l border-slate-800 text-center w-[340px] min-w-[340px]">
                <span className="text-slate-200 font-extrabold text-xs font-heading">
                  Monthly Habit Analysis
                </span>
              </th>
            </tr>

            {/* Row 2: Sub-headers */}
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
              
              {/* Sticky Left: Sub-header */}
              <th className="sticky left-0 z-20 bg-slate-900 px-4 py-2 border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Habit Name</span>
                  <span className="text-[9px] text-slate-500">Actions</span>
                </div>
              </th>

              {/* Center: Day Columns */}
              {days.map((day) => {
                const isSelected = selectedDay === day.dayNumber;
                return (
                  <th
                    key={day.dayNumber}
                    onClick={() => onSelectDay && onSelectDay(day.dayNumber)}
                    className={`px-0.5 py-1 text-center border-r border-slate-800/60 cursor-pointer transition-colors w-[32px] min-w-[32px] max-w-[32px] ${
                      day.isToday
                        ? 'bg-sky-950/80 border-sky-600 text-sky-300 font-black ring-1 ring-inset ring-sky-500/50'
                        : isSelected
                        ? 'bg-slate-800 text-white'
                        : day.isWeekend
                        ? 'bg-slate-950/50 text-slate-500'
                        : 'text-slate-400 hover:bg-slate-800/40'
                    }`}
                    title={`Day ${day.dayNumber} (${day.dayName}) ${day.isToday ? '• TODAY' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`text-[9px] font-medium leading-none ${day.isWeekend ? 'text-slate-500' : 'text-slate-400'}`}>
                        {day.dayName}
                      </span>
                      <span className={`text-xs font-mono-numbers leading-tight mt-0.5 ${
                        day.isToday ? 'text-sky-300 font-extrabold' : 'text-slate-300'
                      }`}>
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-0.5 shadow-sm shadow-sky-400 animate-pulse" />
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Right: Analysis Columns Sub-Headers */}
              <th className="px-4 py-2 bg-slate-900 border-l border-slate-800">
                <div className="grid grid-cols-12 gap-1 text-center font-mono-numbers text-[10px] text-slate-400">
                  <span className="col-span-2 text-slate-400 font-bold" title="Target Planned Days">Goal</span>
                  <span className="col-span-2 text-emerald-400 font-bold" title="Completed Checks (✓)">Done✓</span>
                  <span className="col-span-2 text-rose-400 font-bold" title="Cancelled / Missed Ticks (✕)">Skip✕</span>
                  <span className="col-span-2 text-amber-400 font-bold" title="Remaining Checks Left">Left</span>
                  <span className="col-span-4 text-sky-400 font-bold text-right pr-1">Progress %</span>
                </div>
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/60">
            {habits.length === 0 ? (
              <tr>
                <td colSpan={days.length + 2} className="py-14 text-center bg-slate-950/40">
                  <div className="max-w-md mx-auto flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 font-heading mb-1">
                      Dashboard Reset to 0 (Clean Slate)
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      You are starting fresh from zero! Click <strong className="text-sky-300">Add Habit</strong> to track your first routine, or click <strong className="text-slate-300">Demo</strong> in the top header if you want to preview sample data.
                    </p>
                    <button
                      onClick={onOpenAddModal}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all font-heading"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add First Habit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              habits.map((habit) => {
                const stat = statsMap.get(habit.id) || {
                  habitId: habit.id,
                  goal: habit.targetDays,
                  actual: 0,
                  cancelled: 0,
                  left: habit.targetDays,
                  percentage: 0,
                  isAchieved: false
                };

                return (
                  <tr
                    key={habit.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                  {/* Sticky Left: Habit Title & Category */}
                  <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-850 px-4 py-2.5 border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-xl flex-shrink-0 select-none drop-shadow-sm" role="img" aria-label={habit.name}>
                          {habit.icon || '🎯'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-white transition-colors" title={habit.name}>
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-semibold">
                              {habit.category}
                            </span>
                            <span className="text-[9px] font-mono-numbers text-slate-500">
                              Target: {stat.goal}d
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit / Delete actions on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditHabit(habit)}
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors"
                          title="Edit Habit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Center: 3-State Interactive Cells (Completed ✓ | Cancelled ✕ | Empty) */}
                  {days.map((day) => {
                    const status = getDayStatus(habit.id, day.dayNumber);
                    const isSelected = selectedDay === day.dayNumber;

                    return (
                      <td
                        key={day.dayNumber}
                        className={`p-0 text-center border-r border-slate-800/40 relative ${
                          day.isToday ? 'bg-sky-950/20' : isSelected ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <button
                          onClick={() => onCycleHabitDay(habit.id, day.dayNumber)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            // Right click toggles between cancelled and none directly
                            if (status === 'cancelled') onSetHabitDayStatus(habit.id, day.dayNumber, 'none');
                            else onSetHabitDayStatus(habit.id, day.dayNumber, 'cancelled');
                          }}
                          className={`w-[27px] h-[27px] mx-auto rounded flex items-center justify-center transition-all duration-150 transform active:scale-85 ${
                            status === 'completed'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 shadow-sm shadow-emerald-500/40 hover:brightness-110'
                              : status === 'cancelled'
                              ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-sm shadow-rose-600/40 border border-rose-500/50 hover:brightness-110'
                              : 'bg-slate-950/70 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 text-transparent'
                          }`}
                          title={`${habit.name} - Day ${day.dayNumber} [${
                            status === 'completed' 
                              ? '✓ Completed (Click to set Cancel tick)' 
                              : status === 'cancelled' 
                              ? '✕ Cancelled/Missed (Click to Clear)' 
                              : 'Empty (Click to Mark Completed)'
                          }] (Right-click to Toggle Cancel Tick)`}
                        >
                          {status === 'completed' && (
                            <Check className="w-3.5 h-3.5 stroke-[3.5] text-slate-950 animate-pop" />
                          )}
                          {status === 'cancelled' && (
                            <X className="w-3.5 h-3.5 stroke-[3.5] text-white animate-pop" />
                          )}
                        </button>
                      </td>
                    );
                  })}

                  {/* Right: Habit Analysis Table Columns */}
                  <td className="px-4 py-2 bg-slate-900 group-hover:bg-slate-850 border-l border-slate-800">
                    <div className="grid grid-cols-12 gap-1 items-center font-mono-numbers text-xs">
                      
                      {/* Goal */}
                      <span className="col-span-2 text-center text-slate-300 font-semibold text-[11px]">
                        {stat.goal}
                      </span>

                      {/* Done (Completed Checks) */}
                      <span className="col-span-2 text-center text-emerald-400 font-bold text-[11px]">
                        {stat.actual}✓
                      </span>

                      {/* Skip (Cancelled Ticks) */}
                      <span className={`col-span-2 text-center font-bold text-[11px] ${
                        stat.cancelled > 0 ? 'text-rose-400' : 'text-slate-600'
                      }`}>
                        {stat.cancelled}✕
                      </span>

                      {/* Left */}
                      <span className={`col-span-2 text-center font-bold text-[11px] ${
                        stat.left === 0 ? 'text-slate-500' : 'text-amber-400'
                      }`}>
                        {stat.left}
                      </span>

                      {/* Progress & Rate % */}
                      <div className="col-span-4 pl-1 flex items-center justify-end gap-2">
                        <div className="w-20 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              stat.percentage >= 100
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-sm shadow-emerald-500/50'
                                : stat.percentage >= 70
                                ? 'bg-gradient-to-r from-sky-500 to-cyan-400'
                                : stat.percentage >= 40
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-rose-500 to-orange-400'
                            }`}
                            style={{ width: `${Math.min(100, stat.percentage)}%` }}
                          />
                        </div>
                        <span className={`font-bold text-[11px] min-w-[32px] text-right ${
                          stat.percentage >= 100
                            ? 'text-emerald-400'
                            : stat.percentage >= 70
                            ? 'text-sky-300'
                            : 'text-slate-300'
                        }`}>
                          {stat.percentage}%
                        </span>
                      </div>

                    </div>
                  </td>

                </tr>
              );
            }))}
          </tbody>

          {/* Table Footer: Daily Completion Tally Row */}
          <tfoot>
            <tr className="border-t-2 border-slate-800 bg-slate-950 text-xs">
              
              {/* Sticky Left: Daily Rate Label */}
              <td className="sticky left-0 z-20 bg-slate-950 px-4 py-2.5 border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-slate-400 font-heading">
                    Daily Completion
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-numbers">
                    Done / Skip
                  </span>
                </div>
              </td>

              {/* Center: Daily check tallies */}
              {dayMetrics.map((dm) => {
                const isSelected = selectedDay === dm.dayInfo.dayNumber;
                return (
                  <td
                    key={dm.dayInfo.dayNumber}
                    className={`py-1 text-center border-r border-slate-800/60 font-mono-numbers text-[9px] ${
                      dm.dayInfo.isToday ? 'bg-sky-950/40 text-sky-300 font-bold' : isSelected ? 'bg-slate-800/40 text-white' : 'text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`font-bold ${
                        dm.percentage === 100
                          ? 'text-emerald-400'
                          : dm.percentage >= 70
                          ? 'text-sky-300'
                          : dm.percentage >= 40
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}>
                        {dm.completedCount}✓
                      </span>
                      {dm.cancelledCount > 0 && (
                        <span className="text-[8px] text-rose-400">
                          {dm.cancelledCount}✕
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}

              {/* Right: Summary tally */}
              <td className="px-4 py-2 bg-slate-950 border-l border-slate-800">
                <div className="grid grid-cols-12 gap-1 text-center font-mono-numbers text-[11px] font-bold">
                  <span className="col-span-2 text-slate-400">{analytics.totalGoalChecks}</span>
                  <span className="col-span-2 text-emerald-400">{analytics.totalCompletedChecks}✓</span>
                  <span className="col-span-2 text-rose-400">{analytics.totalCancelledChecks}✕</span>
                  <span className="col-span-2 text-amber-400">{analytics.totalRemainingChecks}</span>
                  <span className="col-span-4 text-right text-emerald-400 pr-1">{analytics.overallPercentage}% Avg</span>
                </div>
              </td>

            </tr>
          </tfoot>

        </table>
      </div>

    </div>
  );
};
