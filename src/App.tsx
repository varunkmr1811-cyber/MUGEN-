import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { 
  AppStorageState, 
  Habit, 
  MoodRating, 
  MonthData,
  DayCheckStatus
} from './types/habit';

import { 
  loadAppState, 
  saveAppState, 
  resetAppState,
  resetToDemoState,
  exportStateAsJSON, 
  importStateFromJSON 
} from './utils/storage';
import { getMonthKey, getDaysInMonth } from './utils/dateUtils';
import { computeMonthAnalytics } from './utils/statsUtils';
import { 
  playCheckSound, 
  playCancelSound, 
  playClearSound, 
  playCelebrationSound, 
  playLevelUpSound 
} from './utils/audio';

import { Header } from './components/Header';
import { StatsRow } from './components/StatsRow';
import { HabitMatrix } from './components/HabitMatrix';
import { WellnessSection } from './components/WellnessSection';
import { MonthNavigation } from './components/MonthNavigation';
import { AddHabitModal } from './components/AddHabitModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DayDetailsModal } from './components/DayDetailsModal';

export const App: React.FC = () => {
  // Current real-world date
  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth() + 1; // 1-indexed

  // Dashboard active view state (Default: September 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  // App persistent state
  const [appState, setAppState] = useState<AppStorageState>(() => loadAppState());

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [dayDetailsNumber, setDayDetailsNumber] = useState<number | null>(null);

  // Hidden file input for JSON import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to localStorage on changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Current Month Data
  const currentMonthKey = getMonthKey(selectedYear, selectedMonth);
  const currentMonthData: MonthData = useMemo(() => {
    return appState.months[currentMonthKey] || {
      habitDays: {},
      completedHabits: {},
      wellness: {}
    };
  }, [appState.months, currentMonthKey]);

  // Analytics for the selected Month
  const analytics = useMemo(() => {
    return computeMonthAnalytics(
      selectedYear,
      selectedMonth,
      appState.habits,
      currentMonthData
    );
  }, [selectedYear, selectedMonth, appState.habits, currentMonthData]);

  // Sound & Profile helpers
  const soundEnabled = appState.userProfile.soundEnabled;

  const triggerXpGain = (amount: number) => {
    setAppState((prev) => {
      const newXp = prev.userProfile.xp + amount;
      const oldLevel = prev.userProfile.level;
      const newLevel = Math.floor(newXp / 500) + 1;

      if (newLevel > oldLevel) {
        playLevelUpSound(soundEnabled);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#38bdf8', '#10b981', '#f59e0b', '#ec4899']
        });
      }

      return {
        ...prev,
        userProfile: {
          ...prev.userProfile,
          xp: Math.max(0, newXp),
          level: newLevel
        }
      };
    });
  };

  // Helper to get status of a habit cell
  const getCellStatus = (habitId: string, dayNumber: number): 'completed' | 'cancelled' | 'none' => {
    if (currentMonthData.habitDays?.[habitId]?.[dayNumber]) {
      return currentMonthData.habitDays[habitId][dayNumber];
    }
    if (currentMonthData.completedHabits?.[habitId]?.includes(dayNumber)) {
      return 'completed';
    }
    return 'none';
  };

  // 3-Way Cycle Handler: None -> Completed (✓) -> Cancelled (✕) -> None
  const handleCycleHabitDay = (habitId: string, dayNumber: number) => {
    const current = getCellStatus(habitId, dayNumber);
    let nextStatus: DayCheckStatus | 'none';

    if (current === 'none') {
      nextStatus = 'completed';
    } else if (current === 'completed') {
      nextStatus = 'cancelled';
    } else {
      nextStatus = 'none';
    }

    handleSetHabitDayStatus(habitId, dayNumber, nextStatus);
  };

  // Direct Set Habit Day Status
  const handleSetHabitDayStatus = (
    habitId: string, 
    dayNumber: number, 
    status: DayCheckStatus | 'none'
  ) => {
    const current = getCellStatus(habitId, dayNumber);

    // Audio and XP triggers
    if (status === 'completed') {
      playCheckSound(soundEnabled);
      if (current !== 'completed') triggerXpGain(10);
    } else if (status === 'cancelled') {
      playCancelSound(soundEnabled);
      if (current === 'completed') triggerXpGain(-10);
    } else {
      playClearSound(soundEnabled);
      if (current === 'completed') triggerXpGain(-10);
    }

    setAppState((prev) => {
      const prevMonth = prev.months[currentMonthKey] || { habitDays: {}, completedHabits: {}, wellness: {} };
      const prevHabitDays = { ...(prevMonth.habitDays || {}) };
      const habitDayMap = { ...(prevHabitDays[habitId] || {}) };

      if (status === 'none') {
        delete habitDayMap[dayNumber];
      } else {
        habitDayMap[dayNumber] = status;
      }
      prevHabitDays[habitId] = habitDayMap;

      // Update legacy completedHabits for backwards compatibility
      const legacyMap = { ...(prevMonth.completedHabits || {}) };
      const currentList = legacyMap[habitId] || [];
      if (status === 'completed') {
        if (!currentList.includes(dayNumber)) legacyMap[habitId] = [...currentList, dayNumber];
      } else {
        legacyMap[habitId] = currentList.filter((d) => d !== dayNumber);
      }

      const updatedMonth: MonthData = {
        ...prevMonth,
        habitDays: prevHabitDays,
        completedHabits: legacyMap
      };

      // Check if this action achieved 100% Day completion
      if (status === 'completed' && prev.habits.length > 0) {
        let allCompleted = true;
        for (const h of prev.habits) {
          const st = prevHabitDays[h.id]?.[dayNumber];
          if (st !== 'completed') {
            allCompleted = false;
            break;
          }
        }

        if (allCompleted) {
          playCelebrationSound(soundEnabled);
          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e']
          });
          triggerXpGain(50); // Perfect Day bonus
        }
      }

      return {
        ...prev,
        months: {
          ...prev.months,
          [currentMonthKey]: updatedMonth
        }
      };
    });
  };

  // Wellness: Update Mood
  const handleUpdateMood = (dayNumber: number, mood: MoodRating | undefined) => {
    setAppState((prev) => {
      const prevMonth = prev.months[currentMonthKey] || { habitDays: {}, completedHabits: {}, wellness: {} };
      const prevWellness = prevMonth.wellness?.[dayNumber] || {};
      return {
        ...prev,
        months: {
          ...prev.months,
          [currentMonthKey]: {
            ...prevMonth,
            wellness: {
              ...prevMonth.wellness,
              [dayNumber]: {
                ...prevWellness,
                mood
              }
            }
          }
        }
      };
    });
    if (mood) {
      playCheckSound(soundEnabled);
      triggerXpGain(5);
    }
  };

  // Wellness: Update Sleep
  const handleUpdateSleep = (dayNumber: number, hours: number | undefined) => {
    setAppState((prev) => {
      const prevMonth = prev.months[currentMonthKey] || { habitDays: {}, completedHabits: {}, wellness: {} };
      const prevWellness = prevMonth.wellness?.[dayNumber] || {};
      return {
        ...prev,
        months: {
          ...prev.months,
          [currentMonthKey]: {
            ...prevMonth,
            wellness: {
              ...prevMonth.wellness,
              [dayNumber]: {
                ...prevWellness,
                sleepHours: hours
              }
            }
          }
        }
      };
    });
  };

  // Wellness: Update Reflection Note
  const handleUpdateNote = (dayNumber: number, note: string) => {
    setAppState((prev) => {
      const prevMonth = prev.months[currentMonthKey] || { habitDays: {}, completedHabits: {}, wellness: {} };
      const prevWellness = prevMonth.wellness?.[dayNumber] || {};
      return {
        ...prev,
        months: {
          ...prev.months,
          [currentMonthKey]: {
            ...prevMonth,
            wellness: {
              ...prevMonth.wellness,
              [dayNumber]: {
                ...prevWellness,
                note
              }
            }
          }
        }
      };
    });
  };

  // Add or Edit Habit
  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    setAppState((prev) => {
      if (existingId) {
        return {
          ...prev,
          habits: prev.habits.map((h) =>
            h.id === existingId ? { ...h, ...habitData } : h
          )
        };
      } else {
        const newHabit: Habit = {
          ...habitData,
          id: `h-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        triggerXpGain(30);
        playCelebrationSound(soundEnabled);
        return {
          ...prev,
          habits: [...prev.habits, newHabit]
        };
      }
    });
    setEditingHabit(null);
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('Are you sure you want to remove this habit?')) {
      setAppState((prev) => ({
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId)
      }));
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    setAppState((prev) => {
      const newEnabled = !prev.userProfile.soundEnabled;
      if (newEnabled) playCheckSound(true);
      return {
        ...prev,
        userProfile: {
          ...prev.userProfile,
          soundEnabled: newEnabled
        }
      };
    });
  };

  // Reset all data completely and start from zero
  const handleResetZero = () => {
    if (window.confirm('⚠️ Are you sure you want to RESET ALL DATA and START FROM 0?\n\nThis will permanently wipe all habits, checkmarks, streaks, and reset XP to 0.')) {
      try {
        localStorage.clear();
      } catch (err) {
        console.error('Failed to clear storage:', err);
      }
      const empty = resetAppState();
      setAppState(empty);
      playClearSound(soundEnabled);
    }
  };

  // Reset to initial rich demo data
  const handleResetDemo = () => {
    if (window.confirm('Reset dashboard to rich demo dataset (includes sample habits, checks and cancel ticks)?')) {
      const reset = resetToDemoState();
      setAppState(reset);
      setSelectedYear(2026);
      setSelectedMonth(9);
      playCelebrationSound(soundEnabled);
    }
  };

  // Export JSON backup
  const handleExport = () => {
    exportStateAsJSON(appState);
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importStateFromJSON(text);
        setAppState(imported);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import file. Please ensure it is a valid MUGEN JSON file.');
      }

    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleJumpToday = () => {
    setSelectedYear(currentRealYear);
    setSelectedMonth(currentRealMonth);
    setDayDetailsNumber(now.getDate());
  };

  const daysInCurrentMonth = getDaysInMonth(selectedYear, selectedMonth);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* 1. Header & Navigation Controls */}
      <Header
        year={selectedYear}
        month={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        onOpenAddModal={() => {
          setEditingHabit(null);
          setIsAddModalOpen(true);
        }}
        onOpenAchievementsModal={() => setIsAchievementsOpen(true)}
        onResetZero={handleResetZero}
        onResetDemo={handleResetDemo}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        xp={appState.userProfile.xp}
        level={appState.userProfile.level}
        streakDays={analytics.currentStreak || appState.userProfile.streakDays}
        onJumpToday={handleJumpToday}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-4">
        
        {/* 2. Top Stats & Analytics Row (Spacious Graphs & High-Impact KPIs) */}
        <StatsRow
          analytics={analytics}
          onSelectDay={(dayNum) => setDayDetailsNumber(dayNum)}
          selectedDay={dayDetailsNumber}
        />

        {/* 3. Main Habit Matrix Grid (With 3-State Toggle & Cancel Ticks) */}
        <HabitMatrix
          habits={appState.habits}
          analytics={analytics}
          monthData={currentMonthData}
          onCycleHabitDay={handleCycleHabitDay}
          onSetHabitDayStatus={handleSetHabitDayStatus}
          onDeleteHabit={handleDeleteHabit}
          onEditHabit={(h) => {
            setEditingHabit(h);
            setIsAddModalOpen(true);
          }}
          onOpenAddModal={() => {
            setEditingHabit(null);
            setIsAddModalOpen(true);
          }}
          selectedDay={dayDetailsNumber}
          onSelectDay={(dayNum) => setDayDetailsNumber(dayNum)}
        />

        {/* 4. Wellness & Mood Section */}
        <WellnessSection
          days={analytics.days}
          monthData={currentMonthData}
          onUpdateMood={handleUpdateMood}
          onUpdateSleep={handleUpdateSleep}
          selectedDay={dayDetailsNumber}
          onSelectDay={(dayNum) => setDayDetailsNumber(dayNum)}
        />

      </main>

      {/* Bottom Month Navigation Tabs (All 12 Months) */}
      <MonthNavigation
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onSelectMonth={setSelectedMonth}
        allMonthsData={appState.months}
      />

      {/* Add / Edit Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
        daysInMonth={daysInCurrentMonth}
      />

      {/* Achievements / Gamification Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        xp={appState.userProfile.xp}
        level={appState.userProfile.level}
        streakDays={analytics.currentStreak || appState.userProfile.streakDays}
        totalCompletedChecks={analytics.totalCompletedChecks}
        perfectDaysCount={analytics.perfectDaysCount}
      />

      {/* Day Details Modal */}
      {dayDetailsNumber !== null && (
        <DayDetailsModal
          isOpen={dayDetailsNumber !== null}
          onClose={() => setDayDetailsNumber(null)}
          dayNumber={dayDetailsNumber}
          month={selectedMonth}
          year={selectedYear}
          habits={appState.habits}
          monthData={currentMonthData}
          onSetHabitDayStatus={handleSetHabitDayStatus}
          onUpdateMood={handleUpdateMood}
          onUpdateSleep={handleUpdateSleep}
          onUpdateNote={handleUpdateNote}
        />
      )}

    </div>
  );
};

export default App;
