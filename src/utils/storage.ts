import type { AppStorageState } from '../types/habit';
import { createInitialStorageState, createDemoStorageState } from './mockData';

const STORAGE_KEY = 'mugen_dashboard_v1';
const LEGACY_KEY = 'habitflow_dashboard_v2';

export function loadAppState(): AppStorageState {
  if (typeof window === 'undefined') {
    return createInitialStorageState();
  }

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy key for existing data transfer
      raw = localStorage.getItem(LEGACY_KEY);
    }

    if (!raw) {
      const initial = createInitialStorageState();
      saveAppState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as AppStorageState;
    // Basic validation
    if (!parsed.habits || !parsed.months || !parsed.userProfile) {
      const initial = createInitialStorageState();
      saveAppState(initial);
      return initial;
    }

    // Auto-migration: ensure habitDays exists in all months
    Object.keys(parsed.months).forEach((mKey) => {
      const mData = parsed.months[mKey];
      if (!mData.habitDays) {
        mData.habitDays = {};
        if (mData.completedHabits) {
          Object.entries(mData.completedHabits).forEach(([habitId, days]) => {
            mData.habitDays[habitId] = {};
            days.forEach((d) => {
              mData.habitDays[habitId][d] = 'completed';
            });
          });
        }
      }
    });

    saveAppState(parsed);
    return parsed;
  } catch (err) {
    console.warn('Failed to parse MUGEN state from localStorage, falling back to mock data:', err);
    const initial = createInitialStorageState();
    saveAppState(initial);
    return initial;
  }
}

export function saveAppState(state: AppStorageState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save MUGEN state to localStorage:', err);
  }
}

export function resetAppState(): AppStorageState {
  const initial = createInitialStorageState();
  saveAppState(initial);
  return initial;
}

export function resetToDemoState(): AppStorageState {
  const demo = createDemoStorageState();
  saveAppState(demo);
  return demo;
}

export function exportStateAsJSON(state: AppStorageState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `mugen_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importStateFromJSON(jsonString: string): AppStorageState {
  const parsed = JSON.parse(jsonString) as AppStorageState;
  if (!parsed.habits || !parsed.months) {
    throw new Error('Invalid MUGEN backup schema.');
  }

  // Ensure habitDays exists
  Object.keys(parsed.months).forEach((mKey) => {
    const mData = parsed.months[mKey];
    if (!mData.habitDays) {
      mData.habitDays = {};
      if (mData.completedHabits) {
        Object.entries(mData.completedHabits).forEach(([habitId, days]) => {
          mData.habitDays[habitId] = {};
          days.forEach((d) => {
            mData.habitDays[habitId][d] = 'completed';
          });
        });
      }
    }
  });

  saveAppState(parsed);
  return parsed;
}
