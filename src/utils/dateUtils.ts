import type { DayInfo, WeekGroup } from '../types/habit';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DAY_OF_WEEK_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Returns total days in a given month (1-based: 1 = Jan, 12 = Dec)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format Year and Month into storage key: "YYYY-MM" (month is 1-based, e.g. 2026-09)
 */
export function getMonthKey(year: number, month: number): string {
  const m = month < 10 ? `0${month}` : `${month}`;
  return `${year}-${m}`;
}

/**
 * Returns structured information for every day of the selected month
 */
export function getMonthDays(year: number, month: number): DayInfo[] {
  const totalDays = getDaysInMonth(year, month);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const days: DayInfo[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = year === currentYear && month === currentMonth && d === currentDay;

    // Calculate Week Index:
    // First day of month's dayOfWeek
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    // Week number calculation standard grouping (1-indexed)
    const weekIndex = Math.floor((d + firstDayOfWeek - 1) / 7) + 1;

    days.push({
      dayNumber: d,
      dayOfWeek,
      dayName: DAY_OF_WEEK_SHORT[dayOfWeek],
      isWeekend,
      isToday,
      weekIndex
    });
  }

  return days;
}

/**
 * Groups days into distinct week buckets (Week 1, Week 2, Week 3, Week 4, Week 5, Week 6)
 */
export function getWeekGroups(days: DayInfo[]): WeekGroup[] {
  const weekMap = new Map<number, DayInfo[]>();

  days.forEach((day) => {
    const list = weekMap.get(day.weekIndex) || [];
    list.push(day);
    weekMap.set(day.weekIndex, list);
  });

  const groups: WeekGroup[] = [];
  const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

  sortedWeeks.forEach((weekNum) => {
    groups.push({
      weekNumber: weekNum,
      days: weekMap.get(weekNum)!
    });
  });

  return groups;
}
