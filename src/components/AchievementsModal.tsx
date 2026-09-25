import React from 'react';
import { X, Trophy, CheckCircle } from 'lucide-react';
import type { Achievement } from '../types/habit';


interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  level: number;
  streakDays: number;
  totalCompletedChecks: number;
  perfectDaysCount: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  xp,
  level,
  streakDays,
  totalCompletedChecks,
  perfectDaysCount
}) => {
  if (!isOpen) return null;

  const achievements: Achievement[] = [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Complete your first habit check-in.',
      icon: '🌱',
      unlocked: totalCompletedChecks >= 1,
      progress: Math.min(100, Math.round((totalCompletedChecks / 1) * 100)),
      xpReward: 50
    },
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Maintain a 7-day active habit streak.',
      icon: '🔥',
      unlocked: streakDays >= 7,
      progress: Math.min(100, Math.round((streakDays / 7) * 100)),
      xpReward: 150
    },
    {
      id: 'perfect-day',
      title: 'Perfectionist',
      description: 'Complete 100% of all habits in a single day.',
      icon: '💎',
      unlocked: perfectDaysCount >= 1,
      progress: Math.min(100, perfectDaysCount > 0 ? 100 : 0),
      xpReward: 200
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Log 100 completed habits in total.',
      icon: '🏆',
      unlocked: totalCompletedChecks >= 100,
      progress: Math.min(100, Math.round((totalCompletedChecks / 100) * 100)),
      xpReward: 300
    },
    {
      id: 'two-week-titan',
      title: 'Fortnight Titan',
      description: 'Reach an uninterrupted 14-day streak.',
      icon: '⚡',
      unlocked: streakDays >= 14,
      progress: Math.min(100, Math.round((streakDays / 14) * 100)),
      xpReward: 400
    },
    {
      id: 'habit-master',
      title: 'Habit Overlord',
      description: 'Log over 250 completed habits.',
      icon: '👑',
      unlocked: totalCompletedChecks >= 250,
      progress: Math.min(100, Math.round((totalCompletedChecks / 250) * 100)),
      xpReward: 600
    }
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 font-heading">
                MUGEN Trophies
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 font-mono-numbers">
                  {unlockedCount} / {achievements.length} Unlocked
                </span>
              </h3>

              <p className="text-xs text-slate-400">Gamified milestones &amp; XP progression</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level & XP Overview */}
        <div className="p-6 bg-slate-950/50 border-b border-slate-800 grid grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Level</span>
            <span className="text-xl font-black text-amber-400 font-mono-numbers">Lvl {level}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total XP</span>
            <span className="text-xl font-black text-sky-400 font-mono-numbers">{xp} XP</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Best Streak</span>
            <span className="text-xl font-black text-rose-400 font-mono-numbers">{streakDays}d 🔥</span>
          </div>
        </div>

        {/* Achievement Badges List */}
        <div className="p-6 space-y-3 max-h-[380px] overflow-y-auto">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-slate-950/80 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-2xl p-2 rounded-lg ${ach.unlocked ? 'bg-amber-500/10' : 'bg-slate-800/50 grayscale'}`}>
                  {ach.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold ${ach.unlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                      {ach.title}
                    </h4>
                    {ach.unlocked && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ach.description}</p>
                </div>
              </div>

              <div className="text-right min-w-[70px]">
                <span className="text-xs font-mono-numbers font-bold text-sky-400">
                  +{ach.xpReward} XP
                </span>
                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                  <div
                    className={`h-full rounded-full ${ach.unlocked ? 'bg-amber-400' : 'bg-slate-600'}`}
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Earn +10 XP per habit &amp; +50 XP on 100% days!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
