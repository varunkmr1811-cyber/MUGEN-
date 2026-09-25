import type { AppStorageState, DayCheckStatus, Habit, MonthData, MoodRating } from '../types/habit';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: 'Wake up at 05:00',
    icon: '⏰',
    category: 'Routine',
    color: '#38bdf8', // sky-400
    targetDays: 25,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'h-2',
    name: 'Gym & Strength Training',
    icon: '💪',
    category: 'Fitness',
    color: '#10b981', // emerald-500
    targetDays: 20,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'h-3',
    name: 'Reading / 30 Mins Learning',
    icon: '📖',
    category: 'Learning',
    color: '#a855f7', // purple-500
    targetDays: 26,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'h-4',
    name: 'Deep Focus Project Work',
    icon: '🎯',
    category: 'Productivity',
    color: '#6366f1', // indigo-500
    targetDays: 22,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'h-5',
    name: 'Cold Shower & Recovery',
    icon: '🚿',
    category: 'Health',
    color: '#06b6d4', // cyan-500
    targetDays: 28,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'h-6',
    name: 'Drink 3L Hydration',
    icon: '💧',
    category: 'Health',
    color: '#3b82f6', // blue-500
    targetDays: 30,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'h-7',
    name: 'Mindful Meditation',
    icon: '🧘',
    category: 'Mindset',
    color: '#f43f5e', // rose-500
    targetDays: 24,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export function generateInitialMonthData(year: number, month: number): MonthData {
  const habitDays: Record<string, Record<number, DayCheckStatus>> = {};
  const completedHabits: Record<string, number[]> = {};
  const wellness: Record<number, { mood?: MoodRating; sleepHours?: number; note?: string }> = {};

  const totalDays = new Date(year, month, 0).getDate();
  const currentDay = (year === 2026 && month === 9) ? 26 : (month < 9 && year === 2026 ? totalDays : 18);

  // Status generator for each habit
  INITIAL_HABITS.forEach((h) => {
    habitDays[h.id] = {};
    const checkedList: number[] = [];

    for (let d = 1; d <= currentDay; d++) {
      if (h.id === 'h-1') {
        // 5 AM wake-up: Sundays are rest/cancelled ticks
        if (d % 7 === 0 || d === 13) {
          habitDays[h.id][d] = 'cancelled';
        } else {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        }
      } else if (h.id === 'h-2') {
        // Gym: Mon/Tue/Thu/Fri completed, Wed/Sat rest cancelled, Sun off
        if ([1, 2, 4, 5, 8, 9, 11, 12, 15, 16, 18, 19, 22, 23, 25, 26].includes(d)) {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        } else if ([3, 7, 10, 14, 17, 21, 24].includes(d)) {
          habitDays[h.id][d] = 'cancelled'; // Cancel tick / rest day
        }
      } else if (h.id === 'h-3') {
        // Reading: completed almost every day, couple missed
        if (d === 6 || d === 14 || d === 20) {
          habitDays[h.id][d] = 'cancelled';
        } else {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        }
      } else if (h.id === 'h-4') {
        // Deep work: weekdays completed, weekends cancelled/off
        if (d % 7 === 6 || d % 7 === 0) {
          habitDays[h.id][d] = 'cancelled';
        } else {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        }
      } else if (h.id === 'h-5') {
        // Cold shower
        if (d === 5 || d === 10 || d === 19) {
          habitDays[h.id][d] = 'cancelled';
        } else {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        }
      } else if (h.id === 'h-6') {
        // Water
        if (d === 7 || d === 21) {
          habitDays[h.id][d] = 'cancelled';
        } else {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        }
      } else {
        // Meditation
        if (d % 4 === 0) {
          habitDays[h.id][d] = 'cancelled';
        } else {
          habitDays[h.id][d] = 'completed';
          checkedList.push(d);
        }
      }
    }
    completedHabits[h.id] = checkedList;
  });

  // Wellness data (Sleep hours & Mood)
  const sleepPresets = [7.5, 8.0, 7.0, 6.5, 8.2, 7.8, 8.5, 7.2, 7.6, 6.8, 7.4, 8.1, 8.0, 7.5, 7.0, 7.8, 8.2, 7.4, 6.5, 7.7, 8.0, 7.9, 8.3, 7.5, 7.8, 8.0];
  const moodPresets: MoodRating[] = [4, 5, 4, 3, 5, 4, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 5, 4, 5, 5];

  for (let d = 1; d <= currentDay; d++) {
    const sleep = sleepPresets[(d - 1) % sleepPresets.length];
    const mood = moodPresets[(d - 1) % moodPresets.length];
    wellness[d] = {
      sleepHours: sleep,
      mood: mood,
      note: d === 26 ? 'Hit 100% morning routine! Feeling locked in.' : undefined
    };
  }

  return {
    habitDays,
    completedHabits,
    wellness
  };
}

// Fresh empty state — start from absolute zero
export function createInitialStorageState(): AppStorageState {
  return {
    habits: [],
    months: {},
    userProfile: {
      xp: 0,
      level: 1,
      streakDays: 0,
      bestStreak: 0,
      soundEnabled: true
    }
  };
}

// Demo state with pre-populated habits & data (used by "Reset to Demo" button)
export function createDemoStorageState(): AppStorageState {
  const months: Record<string, MonthData> = {};

  months['2026-08'] = generateInitialMonthData(2026, 8);
  months['2026-09'] = generateInitialMonthData(2026, 9);
  months['2026-07'] = generateInitialMonthData(2026, 7);

  return {
    habits: INITIAL_HABITS,
    months,
    userProfile: {
      xp: 1420,
      level: 4,
      streakDays: 14,
      bestStreak: 21,
      soundEnabled: true
    }
  };
}

