'use client';

import { useState } from 'react';
import { CalendarCheck, Gift, Flame } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REWARDS = [10, 20, 30, 40, 50, 75, 150];

export function DailyCheckIn() {
  const jsDay = new Date().getDay(); // 0=Sun…6=Sat
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0…Sun=6

  const [checkedIn, setCheckedIn] = useState(false);
  // Simulate a 1-day streak by default; real app would fetch from DB
  const streak = checkedIn ? 2 : 1;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800">Daily Check-In</h3>
        </div>
        <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">
          <Flame className="h-3.5 w-3.5" />
          {streak}-day streak
        </span>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {DAYS.map((day, i) => {
          const isPast = i < todayIdx;
          const isToday = i === todayIdx;
          const isDone = isPast || (isToday && checkedIn);
          const isFuture = i > todayIdx && !(isToday && checkedIn);

          return (
            <div
              key={day}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-center transition-all duration-300 ${
                isDone
                  ? 'bg-indigo-600 shadow-md shadow-indigo-500/30'
                  : isToday
                  ? 'bg-white border-2 border-indigo-500 ring-2 ring-indigo-100'
                  : 'bg-white/60 border border-slate-200'
              }`}
            >
              <span className={`text-[9px] font-bold uppercase tracking-wide ${isDone ? 'text-white/80' : isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                {day}
              </span>
              <Gift className={`h-3.5 w-3.5 ${isDone ? 'text-white' : isToday ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span className={`text-[9px] font-extrabold ${isDone ? 'text-white' : isToday ? 'text-indigo-700' : 'text-slate-300'}`}>
                +{REWARDS[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {!checkedIn ? (
        <button
          onClick={() => setCheckedIn(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300"
        >
          Check In Today · +{REWARDS[todayIdx]} pts
        </button>
      ) : (
        <div className="text-center py-1">
          <p className="text-green-700 font-bold text-sm">✓ Checked in! +{REWARDS[todayIdx]} points earned</p>
          <p className="text-slate-400 text-xs mt-0.5">Come back tomorrow to keep your streak going 🔥</p>
        </div>
      )}
    </div>
  );
}
