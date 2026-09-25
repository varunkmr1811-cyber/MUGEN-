export type HabitCategory = 
  | 'Fitness'
  | 'Productivity'
  | 'Health'
  | 'Mindset'
  | 'Learning'
  | 'Routine'
  | 'Custom';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  color: string; // e.g. 'emerald', 'sky', 'indigo', 'amber', 'rose', 'purple'
  targetDays: number; // monthly target (e.g., 25 or total days)
  createdAt: string;
}

export type MoodRating = 1 | 2 | 3 | 4 | 5; // 1: Terrible, 2: Poor, 3: Neutral, 4: Good, 5: Awesome

export interface DailyWellness {
  mood?: MoodRating;
  sleepHours?: number; // e.g., 7.5
  note?: string;
}

export type DayCheckStatus = 'completed' | 'cancelled';

export interface MonthData {
  // key: habitId -> map of dayNumber (1..31) -> DayCheckStatus ('completed' | 'cancelled')
  habitDays: Record<string, Record<number, DayCheckStatus>>;
  // legacy completedHabits for backwards compatibility
  completedHabits?: Record<string, number[]>;
  // key: dayNumber (1..31) -> wellness data
  wellness: Record<number, DailyWellness>;
}

// All data stored by year-month string "YYYY-MM" (e.g., "2026-09")
export interface AppStorageState {
  habits: Habit[];
  months: Record<string, MonthData>;
  userProfile: {
    xp: number;
    level: number;
    streakDays: number;
    bestStreak: number;
    soundEnabled: boolean;
  };
}

export interface DayInfo {
  dayNumber: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string; // Su, Mo, Tu, We, Th, Fr, Sa
  isWeekend: boolean;
  isToday: boolean;
  weekIndex: number; // 1, 2, 3, 4, 5, 6
}

export interface WeekGroup {
  weekNumber: number; // 1..6
  days: DayInfo[];
}

export interface HabitStat {
  habitId: string;
  goal: number;
  actual: number; // completed checks count
  cancelled: number; // cancelled / skipped ticks count
  left: number;
  percentage: number;
  isAchieved: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0..100
  xpReward: number;
}
