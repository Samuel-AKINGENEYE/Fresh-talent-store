'use client';

import { Trophy, ShoppingBag, Star, Zap, Heart, Crown, Gift, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  Icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_order',  Icon: ShoppingBag, label: 'First Purchase',   desc: 'Placed your very first order',    color: 'text-blue-600',   bg: 'bg-blue-100',   border: 'border-blue-200',   unlocked: false },
  { id: 'loyal_5',      Icon: Star,        label: 'Loyal Shopper',    desc: 'Completed 5 orders',              color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200', unlocked: false },
  { id: 'big_spender',  Icon: Crown,       label: 'Big Spender',      desc: 'Spent over RWF 500,000 total',    color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', unlocked: false },
  { id: 'bronze_tier',  Icon: Trophy,      label: 'Bronze Member',    desc: 'Reached Bronze loyalty tier',     color: 'text-amber-600',  bg: 'bg-amber-100',  border: 'border-amber-200',  unlocked: true  },
  { id: 'flash_hunter', Icon: Zap,         label: 'Flash Hunter',     desc: 'Purchased a flash sale item',     color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', unlocked: false },
  { id: 'reviewer',     Icon: Heart,       label: 'Helpful Reviewer', desc: 'Left your first product review',  color: 'text-pink-600',   bg: 'bg-pink-100',   border: 'border-pink-200',   unlocked: false },
  { id: 'referrer',     Icon: Gift,        label: 'Ambassador',       desc: 'Referred a friend to the store',  color: 'text-green-600',  bg: 'bg-green-100',  border: 'border-green-200',  unlocked: false },
  { id: 'streak_7',     Icon: Flame,       label: '7-Day Streak',     desc: 'Visited 7 days in a row',         color: 'text-red-600',    bg: 'bg-red-100',    border: 'border-red-200',    unlocked: false },
];

export function AchievementBadges() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const pct = Math.round((unlocked / ACHIEVEMENTS.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {unlocked}/{ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {/* Global progress bar */}
      <div className="mt-3 mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Overall progress</span>
          <span className="font-semibold text-slate-700">{pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.Icon;
          return (
            <div
              key={a.id}
              title={a.desc}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-300 ${
                a.unlocked
                  ? `${a.bg} ${a.border} shadow-sm`
                  : 'bg-slate-50 border-slate-100 opacity-50'
              }`}
            >
              {a.unlocked && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">✓</span>
              )}
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${a.unlocked ? a.bg : 'bg-slate-200'}`}>
                <Icon className={`h-5 w-5 ${a.unlocked ? a.color : 'text-slate-400'}`} />
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${a.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                  {a.label}
                </p>
                {!a.unlocked && (
                  <p className="text-[10px] text-slate-400 mt-0.5">🔒 Locked</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next milestone hint */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-xs text-blue-700 font-medium">
          💡 <strong>Next badge:</strong> Place your first order to unlock <em>First Purchase</em> and earn 100 bonus points!
        </p>
      </div>
    </div>
  );
}
