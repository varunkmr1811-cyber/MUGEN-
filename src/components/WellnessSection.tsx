import React, { useState } from 'react';
import type { DayInfo, MoodRating, MonthData } from '../types/habit';
import { Smile, Moon, Sparkles, TrendingUp } from 'lucide-react';

interface WellnessSectionProps {
  days: DayInfo[];
  monthData: MonthData;
  onUpdateMood: (dayNumber: number, mood: MoodRating | undefined) => void;
  onUpdateSleep: (dayNumber: number, hours: number | undefined) => void;
  selectedDay?: number | null;
  onSelectDay?: (dayNumber: number) => void;
}

const MOOD_EMOJIS: Record<MoodRating, { emoji: string; label: string; color: string }> = {
  5: { emoji: '🤩', label: 'Awesome', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60' },
  4: { emoji: '🙂', label: 'Good', color: 'text-sky-400 bg-sky-950/80 border-sky-700/60' },
  3: { emoji: '😐', label: 'Neutral', color: 'text-amber-400 bg-amber-950/80 border-amber-700/60' },
  2: { emoji: '😕', label: 'Low', color: 'text-orange-400 bg-orange-950/80 border-orange-700/60' },
  1: { emoji: '😭', label: 'Rough', color: 'text-rose-400 bg-rose-950/80 border-rose-700/60' }
};

export const WellnessSection: React.FC<WellnessSectionProps> = ({
  days,
  monthData,
  onUpdateMood,
  onUpdateSleep,
  selectedDay,
  onSelectDay
}) => {
  const [activeMoodPickerDay, setActiveMoodPickerDay] = useState<number | null>(null);

  const wellnessData = monthData.wellness || {};

  // Compute average mood
  const moodEntries = Object.values(wellnessData)
    .map((w) => w.mood)
    .filter((m): m is MoodRating => m !== undefined);
  const avgMood = moodEntries.length > 0 
    ? (moodEntries.reduce((a, b) => a + b, 0) / moodEntries.length).toFixed(1)
    : '—';

  // Compute average sleep
  const sleepEntries = Object.values(wellnessData)
    .map((w) => w.sleepHours)
    .filter((s): s is number => s !== undefined && s > 0);
  const avgSleep = sleepEntries.length > 0
    ? (sleepEntries.reduce((a, b) => a + b, 0) / sleepEntries.length).toFixed(1)
    : '—';

  // Generate SVG points for sleep trend line across all days
  const chartHeight = 38;
  const maxSleep = 12;
  const minSleep = 4;
  const validSleepPoints: { x: number; y: number; val: number }[] = [];

  days.forEach((day, index) => {
    const sleep = wellnessData[day.dayNumber]?.sleepHours;
    if (sleep !== undefined && sleep > 0) {
      const clamped = Math.max(minSleep, Math.min(maxSleep, sleep));
      const y = chartHeight - ((clamped - minSleep) / (maxSleep - minSleep)) * (chartHeight - 8) - 4;
      const x = index * 32 + 16;
      validSleepPoints.push({ x, y, val: sleep });
    }
  });

  const pathD = validSleepPoints.length > 1
    ? validSleepPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
      
      {/* Section Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 font-heading">
            Wellness &amp; Daily Mood Analytics
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            (Mind &amp; Sleep Rest Sync)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Avg Mood:</span>
            <span className="font-bold text-amber-400">{avgMood} / 5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Avg Sleep:</span>
            <span className="font-bold text-sky-400">{avgSleep} hrs</span>
          </div>
        </div>
      </div>

      {/* Synchronized Table Layout matching Habit Matrix */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse select-none min-w-[1240px]">
          <tbody>
            
            {/* ROW 1: MOOD SELECTOR */}
            <tr className="border-b border-slate-800/80 hover:bg-slate-850/40 transition-colors">
              
              {/* Sticky Left: Mood Header */}
              <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2.5 w-[290px] min-w-[290px] border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Smile className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block font-heading">Daily Mood</span>
                      <span className="text-[10px] text-slate-400">1 (Rough) to 5 (Awesome)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">
                    {avgMood}★
                  </span>
                </div>
              </td>

              {/* Center: Mood Cells for each day */}
              {days.map((day) => {
                const mood = wellnessData[day.dayNumber]?.mood;
                const isSelected = selectedDay === day.dayNumber;
                const isPickerOpen = activeMoodPickerDay === day.dayNumber;

                return (
                  <td
                    key={day.dayNumber}
                    className={`p-0 text-center border-r border-slate-800/40 relative w-[32px] min-w-[32px] max-w-[32px] ${
                      day.isToday ? 'bg-sky-950/20' : isSelected ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <button
                        onClick={() => {
                          setActiveMoodPickerDay(isPickerOpen ? null : day.dayNumber);
                          onSelectDay?.(day.dayNumber);
                        }}
                        className={`w-[27px] h-[27px] mx-auto rounded flex items-center justify-center text-sm transition-all transform active:scale-90 ${
                          mood
                            ? 'hover:scale-110 shadow-sm'
                            : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-600 text-slate-600 hover:text-slate-400'
                        }`}
                        title={`Day ${day.dayNumber} Mood: ${mood ? MOOD_EMOJIS[mood].label : 'Click to set mood'}`}
                      >
                        {mood ? MOOD_EMOJIS[mood].emoji : '·'}
                      </button>

                      {/* Micro Mood Picker Popup */}
                      {isPickerOpen && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 bg-slate-950 border border-slate-700 rounded-lg p-1 shadow-2xl flex items-center gap-1 animate-pop">
                          {([5, 4, 3, 2, 1] as MoodRating[]).map((val) => (
                            <button
                              key={val}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateMood(day.dayNumber, val);
                                setActiveMoodPickerDay(null);
                              }}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-slate-800 transition-transform hover:scale-125 ${
                                mood === val ? 'bg-slate-800 ring-1 ring-sky-400' : ''
                              }`}
                              title={MOOD_EMOJIS[val].label}
                            >
                              {MOOD_EMOJIS[val].emoji}
                            </button>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateMood(day.dayNumber, undefined);
                              setActiveMoodPickerDay(null);
                            }}
                            className="text-[9px] text-slate-500 hover:text-rose-400 px-1 font-mono-numbers"
                            title="Clear"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}

              {/* Right: Mood Stats Breakdown */}
              <td className="px-4 py-2 bg-slate-900 border-l border-slate-800 w-[340px] min-w-[340px]">
                <div className="flex items-center justify-between text-xs font-mono-numbers">
                  <span className="text-slate-400 text-[11px]">Logged Days:</span>
                  <span className="text-slate-200 font-bold">{moodEntries.length} / {days.length}</span>
                  <span className="text-amber-400 font-bold ml-2">Rating: {avgMood} / 5</span>
                </div>
              </td>

            </tr>

            {/* ROW 2: SLEEP HOURS INPUTS */}
            <tr className="border-b border-slate-800/80 hover:bg-slate-850/40 transition-colors">
              
              {/* Sticky Left: Sleep Header */}
              <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2.5 w-[290px] min-w-[290px] border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block font-heading">Hours of Sleep</span>
                      <span className="text-[10px] text-slate-400">Target: 7.0 – 9.0 hrs</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 font-bold">
                    {avgSleep}h
                  </span>
                </div>
              </td>

              {/* Center: Sleep Input Cells */}
              {days.map((day) => {
                const sleep = wellnessData[day.dayNumber]?.sleepHours;
                const isSelected = selectedDay === day.dayNumber;

                let textColor = 'text-slate-500';
                if (sleep !== undefined && sleep > 0) {
                  if (sleep >= 7 && sleep <= 9) textColor = 'text-emerald-400 font-bold';
                  else if (sleep >= 6) textColor = 'text-sky-400 font-bold';
                  else textColor = 'text-rose-400 font-bold';
                }

                return (
                  <td
                    key={day.dayNumber}
                    className={`p-0 text-center border-r border-slate-800/40 w-[32px] min-w-[32px] max-w-[32px] ${
                      day.isToday ? 'bg-sky-950/20' : isSelected ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sleep !== undefined ? sleep : ''}
                      placeholder="—"
                      onFocus={() => onSelectDay?.(day.dayNumber)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          onUpdateSleep(day.dayNumber, undefined);
                        } else {
                          const num = parseFloat(val);
                          if (!isNaN(num) && num >= 0 && num <= 24) {
                            onUpdateSleep(day.dayNumber, num);
                          }
                        }
                      }}
                      className={`w-[28px] h-[26px] mx-auto bg-slate-950/60 border border-slate-800/80 focus:border-sky-500 focus:bg-slate-900 rounded text-center text-[10px] font-mono-numbers focus:outline-none transition-colors ${textColor}`}
                      title={`Day ${day.dayNumber} Sleep Hours: ${sleep ?? 'Not logged'}`}
                    />
                  </td>
                );
              })}

              {/* Right: Sleep Stats Breakdown */}
              <td className="px-4 py-2 bg-slate-900 border-l border-slate-800 w-[340px] min-w-[340px]">
                <div className="flex items-center justify-between text-xs font-mono-numbers">
                  <span className="text-slate-400 text-[11px]">Monthly Average:</span>
                  <span className="text-sky-300 font-bold">{avgSleep} hrs / night</span>
                </div>
              </td>

            </tr>

            {/* ROW 3: MINI SLEEP TREND LINE SPARKLINE */}
            <tr className="bg-slate-950/40">
              
              {/* Sticky Left: Trend Header */}
              <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 w-[290px] min-w-[290px] border-r border-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-heading">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sleep Curve Trend</span>
                </div>
              </td>

              {/* Center: Spanning SVG Sparkline across all day columns */}
              <td colSpan={days.length} className="p-0 border-r border-slate-800/40 relative">
                <div className="w-full h-10 relative overflow-hidden bg-slate-950/60">
                  <svg 
                    className="w-full h-full"
                    viewBox={`0 0 ${days.length * 32} ${chartHeight}`} 
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Target baseline line (8 hours) */}
                    <line
                      x1="0"
                      y1={chartHeight - ((8 - minSleep) / (maxSleep - minSleep)) * (chartHeight - 8) - 4}
                      x2={days.length * 32}
                      y2={chartHeight - ((8 - minSleep) / (maxSleep - minSleep)) * (chartHeight - 8) - 4}
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.4"
                    />

                    {/* Area fill */}
                    {pathD && (
                      <path
                        d={`${pathD} L ${validSleepPoints[validSleepPoints.length - 1].x} ${chartHeight} L ${validSleepPoints[0].x} ${chartHeight} Z`}
                        fill="url(#sleepGradient)"
                      />
                    )}

                    {/* Line curve */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Dots for each point */}
                    {validSleepPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="2.5"
                        fill="#38bdf8"
                        className="hover:r-4 transition-all"
                      />
                    ))}
                  </svg>
                </div>
              </td>

              {/* Right: Trend info */}
              <td className="px-4 py-2 bg-slate-900 border-l border-slate-800 w-[340px] min-w-[340px]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-emerald-400" />
                    <span>8h Optimal Target</span>
                  </span>
                  <span className="text-sky-400 font-bold">
                    {sleepEntries.length} nights tracked
                  </span>
                </div>
              </td>

            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};
