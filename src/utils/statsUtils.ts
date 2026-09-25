import type { DayInfo, Habit, HabitStat, MonthData, WeekGroup } from '../types/habit';
import { getMonthDays, getWeekGroups } from './dateUtils';

export interface DayMetric {
  dayInfo: DayInfo;
  completedCount: number;
  cancelledCount: number;
  totalHabits: number;
  percentage: number;
}

export interface WeekMetric {
  weekNumber: number;
  dayCount: number;
  completedChecks: number;
  cancelledChecks: number;
  possibleChecks: number;
  percentage: number;
}

export interface MonthAnalytics {
  days: DayInfo[];
  weekGroups: WeekGroup[];
  habitStats: HabitStat[];
  dayMetrics: DayMetric[];
  weekMetrics: WeekMetric[];
  totalGoalChecks: number;
  totalCompletedChecks: number;
  totalCancelledChecks: number;
  totalRemainingChecks: number;
  overallPercentage: number;
  perfectDaysCount: number;
  averageDailyCompletion: number;
  currentStreak: number;
}

export function computeMonthAnalytics(
  year: number,
  month: number,
  habits: Habit[],
  monthData?: MonthData
): MonthAnalytics {
  const days = getMonthDays(year, month);
  const weekGroups = getWeekGroups(days);
  const totalHabits = habits.length;

  const habitDaysMap = monthData?.habitDays || {};
  const legacyCompleted = monthData?.completedHabits || {};

  // Helper to get status of a habit on a day
  const getStatus = (habitId: string, dayNum: number): 'completed' | 'cancelled' | 'none' => {
    if (habitDaysMap[habitId]?.[dayNum]) {
      return habitDaysMap[habitId][dayNum];
    }
    if (legacyCompleted[habitId]?.includes(dayNum)) {
      return 'completed';
    }
    return 'none';
  };

  // 1. Habit stats
  const habitStats: HabitStat[] = habits.map((h) => {
    let actual = 0;
    let cancelled = 0;

    for (let d = 1; d <= days.length; d++) {
      const st = getStatus(h.id, d);
      if (st === 'completed') actual++;
      else if (st === 'cancelled') cancelled++;
    }

    const goal = Math.min(days.length, h.targetDays || days.length);
    const left = Math.max(0, goal - actual);
    const percentage = goal > 0 ? Math.min(100, Math.round((actual / goal) * 100)) : 0;

    return {
      habitId: h.id,
      goal,
      actual,
      cancelled,
      left,
      percentage,
      isAchieved: actual >= goal
    };
  });

  // 2. Day metrics
  const dayMetrics: DayMetric[] = days.map((day) => {
    let completedCount = 0;
    let cancelledCount = 0;

    habits.forEach((h) => {
      const st = getStatus(h.id, day.dayNumber);
      if (st === 'completed') completedCount++;
      else if (st === 'cancelled') cancelledCount++;
    });

    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

    return {
      dayInfo: day,
      completedCount,
      cancelledCount,
      totalHabits,
      percentage
    };
  });

  // 3. Week metrics
  const weekMetrics: WeekMetric[] = weekGroups.map((group) => {
    const dayNumbers = group.days.map((d) => d.dayNumber);
    let completedChecks = 0;
    let cancelledChecks = 0;
    const possibleChecks = group.days.length * totalHabits;

    habits.forEach((h) => {
      dayNumbers.forEach((d) => {
        const st = getStatus(h.id, d);
        if (st === 'completed') completedChecks++;
        else if (st === 'cancelled') cancelledChecks++;
      });
    });

    const percentage = possibleChecks > 0 ? Math.round((completedChecks / possibleChecks) * 100) : 0;

    return {
      weekNumber: group.weekNumber,
      dayCount: group.days.length,
      completedChecks,
      cancelledChecks,
      possibleChecks,
      percentage
    };
  });

  // 4. Totals
  const totalGoalChecks = habitStats.reduce((acc, h) => acc + h.goal, 0);
  const totalCompletedChecks = habitStats.reduce((acc, h) => acc + h.actual, 0);
  const totalCancelledChecks = habitStats.reduce((acc, h) => acc + h.cancelled, 0);
  const totalRemainingChecks = Math.max(0, totalGoalChecks - totalCompletedChecks);

  const overallPercentage = totalGoalChecks > 0 ? Math.round((totalCompletedChecks / totalGoalChecks) * 100) : 0;

  const perfectDaysCount = dayMetrics.filter((m) => m.percentage === 100 && totalHabits > 0).length;

  const sumPercentages = dayMetrics.reduce((acc, m) => acc + m.percentage, 0);
  const averageDailyCompletion = days.length > 0 ? Math.round(sumPercentages / days.length) : 0;

  // 5. Streak calculation
  let currentStreak = 0;
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const targetDay = isCurrentMonth ? now.getDate() : days.length;

  for (let d = targetDay; d >= 1; d--) {
    const metric = dayMetrics.find((m) => m.dayInfo.dayNumber === d);
    if (metric && metric.completedCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    days,
    weekGroups,
    habitStats,
    dayMetrics,
    weekMetrics,
    totalGoalChecks,
    totalCompletedChecks,
    totalCancelledChecks,
    totalRemainingChecks,
    overallPercentage,
    perfectDaysCount,
    averageDailyCompletion,
    currentStreak
  };
}
