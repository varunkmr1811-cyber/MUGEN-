import React, { useState } from 'react';
import type { MonthAnalytics } from '../utils/statsUtils';
import { 
  CheckCircle2, 
  Target, 
  Clock, 
  Award, 
  Zap, 
  XCircle, 
  BarChart3,
  Calendar
} from 'lucide-react';


interface StatsRowProps {
  analytics: MonthAnalytics;
  onSelectDay?: (dayNumber: number) => void;
  selectedDay?: number | null;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  analytics,
  onSelectDay,
  selectedDay
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const {
    dayMetrics,
    weekMetrics,
    totalGoalChecks,
    totalCompletedChecks,
    totalCancelledChecks,
    totalRemainingChecks,
    overallPercentage,
    perfectDaysCount,
    averageDailyCompletion
  } = analytics;

  // Donut Gauge math (160px size)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, overallPercentage)) / 100) * circumference;

  const getStatusText = (pct: number) => {
    if (pct >= 90) return { label: 'Elite Flow', color: 'text-emerald-400', bg: 'bg-emerald-950/80 border-emerald-700/60' };
    if (pct >= 75) return { label: 'On Track', color: 'text-sky-400', bg: 'bg-sky-950/80 border-sky-700/60' };
    if (pct >= 50) return { label: 'Steady Pace', color: 'text-amber-400', bg: 'bg-amber-950/80 border-amber-700/60' };
    return { label: 'Needs Focus', color: 'text-rose-400', bg: 'bg-rose-950/80 border-rose-700/60' };
  };

  const status = getStatusText(overallPercentage);

  return (
    <div className="space-y-3.5 mb-5">
      
      {/* 1. TOP KPI STRIP (4 Sharp High-Density Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: Total Goal */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
              Planned Goal
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono-numbers text-white tracking-tight">
              {totalGoalChecks}
            </span>
            <span className="text-xs text-slate-400 font-medium">checks</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across all active habits</p>
        </div>

        {/* KPI 2: Completed Checks */}
        <div className="bg-slate-900/90 border border-emerald-900/40 hover:border-emerald-700/60 rounded-xl p-3.5 shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-heading">
              Completed Checks
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono-numbers text-emerald-400 tracking-tight">
              {totalCompletedChecks}
            </span>
            <span className="text-xs font-mono-numbers px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
              {overallPercentage}% done
            </span>
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-1">✓ Logged habit executions</p>
        </div>

        {/* KPI 3: Cancelled / Skipped Ticks */}
        <div className="bg-slate-900/90 border border-rose-900/40 hover:border-rose-700/60 rounded-xl p-3.5 shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-heading">
              Cancelled / Missed
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono-numbers text-rose-400 tracking-tight">
              {totalCancelledChecks}
            </span>
            <span className="text-xs text-slate-400 font-medium">ticks</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">✕ Rest / skipped check-ins</p>
        </div>

        {/* KPI 4: Remaining Checks */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-heading">
              Remaining / Left
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono-numbers text-amber-400 tracking-tight">
              {totalRemainingChecks}
            </span>
            <span className="text-xs text-slate-400 font-medium">checks left</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">To reach 100% monthly target</p>
        </div>

      </div>

      {/* 2. MAIN GRAPHS ROW: Generous Size Daily Progress Chart + Donut & Weekly Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* LARGE DAILY PROGRESS CHART (Cols 1-8) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          
          {/* Chart Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-heading">
                    Daily Progress Analytics
                  </h2>
                  <span className="text-[11px] font-mono-numbers text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50 font-semibold">
                    Avg {averageDailyCompletion}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Daily habit completion rate across the entire month (0% to 100%)
                </p>
              </div>
            </div>

            {/* Legend & Perfect Days Callout */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-500 to-teal-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-slate-300 font-medium">100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-sky-500 to-cyan-400" />
                <span className="text-slate-300 font-medium">≥70%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-amber-500 to-yellow-400" />
                <span className="text-slate-300 font-medium">&lt;70%</span>
              </div>
            </div>
          </div>

          {/* Large Vertical Bar Chart Area (Height: 210px with clean Y-axis grid) */}
          <div className="relative pt-6 pb-2 my-2">
            
            {/* Horizontal Gridlines & Y-Axis Scale */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 pb-10 pt-2 text-[10px] font-mono-numbers text-slate-600">
              <div className="border-b border-slate-800/60 w-full flex items-center justify-between">
                <span>100%</span>
              </div>
              <div className="border-b border-dashed border-sky-500/30 w-full flex items-center justify-between text-sky-400/80">
                <span>80% Target</span>
                <span className="text-[9px] px-1 bg-slate-900 border border-sky-800/40 rounded">Goal Threshold</span>
              </div>
              <div className="border-b border-slate-800/60 w-full flex items-center justify-between">
                <span>50%</span>
              </div>
              <div className="border-b border-slate-800/60 w-full flex items-center justify-between">
                <span>25%</span>
              </div>
              <div className="border-b border-slate-800 w-full flex items-center justify-between">
                <span>0%</span>
              </div>
            </div>

            {/* The Vertical Bars Container */}
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 relative z-10 px-6">
              {dayMetrics.map((metric) => {
                const { dayInfo, percentage, completedCount, cancelledCount, totalHabits } = metric;
                const isHovered = hoveredDay === dayInfo.dayNumber;
                const isSelected = selectedDay === dayInfo.dayNumber;

                let barColor = 'from-slate-700 to-slate-800';
                let glowClass = '';
                if (percentage === 100) {
                  barColor = 'from-emerald-500 via-teal-400 to-emerald-300';
                  glowClass = 'shadow-md shadow-emerald-500/40 ring-1 ring-emerald-300/40';
                } else if (percentage >= 70) {
                  barColor = 'from-sky-500 to-cyan-400';
                  glowClass = 'shadow-sm shadow-sky-500/30';
                } else if (percentage >= 40) {
                  barColor = 'from-amber-500 to-yellow-400';
                } else if (percentage > 0) {
                  barColor = 'from-rose-500 to-orange-400';
                }

                return (
                  <div
                    key={dayInfo.dayNumber}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                    onMouseEnter={() => setHoveredDay(dayInfo.dayNumber)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => onSelectDay && onSelectDay(dayInfo.dayNumber)}
                  >
                    {/* Hover Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-30 bg-slate-950 border border-slate-700 text-slate-100 p-2 rounded-lg shadow-2xl text-xs whitespace-nowrap pointer-events-none animate-pop">
                        <div className="font-bold flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1">
                          <span className="text-slate-200">Day {dayInfo.dayNumber} ({dayInfo.dayName})</span>
                          <span className="text-sky-300 font-mono-numbers font-bold">{percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px]">
                          <span className="text-emerald-400 font-mono-numbers">✓ {completedCount} Done</span>
                          <span className="text-rose-400 font-mono-numbers">✕ {cancelledCount} Missed</span>
                          <span className="text-slate-400 font-mono-numbers">/ {totalHabits} total</span>
                        </div>
                      </div>
                    )}

                    {/* Bar Pillar */}
                    <div className="w-full bg-slate-950/80 rounded-t-md h-40 flex items-end overflow-hidden p-0.5 border border-slate-800/80">
                      <div
                        className={`w-full rounded-t-sm bg-gradient-to-t ${barColor} ${glowClass} transition-all duration-300 ${
                          isHovered || isSelected ? 'brightness-125 scale-y-105' : ''
                        }`}
                        style={{
                          height: `${Math.max(percentage > 0 ? 6 : 2, percentage)}%`
                        }}
                      />
                    </div>

                    {/* Day Number and Day-of-week Sub-label */}
                    <div className="flex flex-col items-center mt-1.5">
                      <span
                        className={`text-[10px] font-mono-numbers font-bold transition-colors ${
                          dayInfo.isToday
                            ? 'text-sky-300 bg-sky-950 px-1 rounded ring-1 ring-sky-500/50'
                            : isHovered
                            ? 'text-white'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayInfo.dayNumber}
                      </span>
                      <span className="text-[8px] text-slate-500 uppercase leading-none mt-0.5">
                        {dayInfo.dayName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Chart Footer Metrics */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Perfect 100% Days:</span>
              <strong className="text-emerald-400 font-mono-numbers">{perfectDaysCount} Days Achieved</strong>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Target Baseline:</span>
              <strong className="text-slate-200 font-mono-numbers">80% completion</strong>
            </div>
          </div>

        </div>

        {/* OVERALL PROGRESS DONUT & WEEKLY COMPARISON (Cols 9-12) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          
          {/* A. Prominent Overall Donut Gauge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between text-center relative overflow-hidden flex-1">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                Monthly Completion Donut
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* Large SVG Donut Gauge (160px) */}
            <div className="relative my-3">
              <svg className="w-40 h-40 transform -rotate-90 drop-shadow-xl" viewBox="0 0 130 130">
                <defs>
                  <linearGradient id="largeProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Outer decorative track */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius + 4}
                  stroke="rgba(30, 41, 59, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  fill="transparent"
                />

                {/* Background track circle */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="11"
                  fill="transparent"
                />

                {/* Filled progress circle */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="url(#largeProgressGradient)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-mono-numbers text-white tracking-tight">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Success Rate
                </span>
              </div>
            </div>

            <div className="w-full pt-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Goal Progress:</span>
              <span className="font-mono-numbers font-bold text-slate-200">
                {totalCompletedChecks} of {totalGoalChecks} checks
              </span>
            </div>
          </div>

          {/* B. Weekly Progress Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                  Weekly Consistency
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                W1 – W{weekMetrics.length}
              </span>
            </div>

            <div className="space-y-2 py-1">
              {weekMetrics.map((wm) => {
                const isTopWeek = Math.max(...weekMetrics.map((w) => w.percentage)) === wm.percentage && wm.percentage > 0;
                return (
                  <div key={wm.weekNumber} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold flex items-center gap-1 ${isTopWeek ? 'text-emerald-400' : 'text-slate-300'}`}>
                        Week {wm.weekNumber}
                        {isTopWeek && (
                          <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            ★ Top
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 font-mono-numbers text-[11px]">
                        <span className="text-emerald-400 font-bold">{wm.percentage}%</span>
                        <span className="text-slate-500">({wm.completedChecks}✓ / {wm.cancelledChecks}✕)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          wm.percentage >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : wm.percentage >= 60
                            ? 'bg-gradient-to-r from-sky-500 to-cyan-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        }`}
                        style={{ width: `${wm.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
