'use client';

import { useState } from 'react';

interface Segment {
  label: string;
  color: string;
  reward: string;
  code?: string;
}

const SEGMENTS: Segment[] = [
  { label: '5% OFF',       color: '#3B82F6', reward: '5% discount',       code: 'SPIN5'    },
  { label: 'Free Ship',    color: '#10B981', reward: 'Free delivery',      code: 'FREESHIP' },
  { label: '10% OFF',      color: '#F97316', reward: '10% discount',       code: 'SPIN10'   },
  { label: '+200 pts',     color: '#8B5CF6', reward: '200 bonus points'                      },
  { label: '15% OFF',      color: '#EF4444', reward: '15% discount',       code: 'SPIN15'   },
  { label: '+50 pts',      color: '#F59E0B', reward: '50 bonus points'                       },
  { label: '20% OFF',      color: '#06B6D4', reward: '20% discount',       code: 'SPIN20'   },
  { label: 'Try Again',    color: '#6B7280', reward: 'Better luck tomorrow!'                  },
];

const N = SEGMENTS.length;
const DEG = 360 / N;

function polarXY(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedge(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarXY(cx, cy, r, start);
  const e = polarXY(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [result, setResult] = useState<Segment | null>(null);

  const spin = () => {
    if (spinning || spinsLeft === 0) return;
    const winIdx = Math.floor(Math.random() * N);
    const extraTurns = (5 + Math.floor(Math.random() * 3)) * 360;
    const land = 360 - (winIdx * DEG + DEG / 2);
    const base = rotation % 360;
    const total = rotation + extraTurns + ((land - base + 360) % 360);

    setSpinning(true);
    setResult(null);
    setRotation(total);
    setSpinsLeft((p) => p - 1);
    setTimeout(() => {
      setResult(SEGMENTS[winIdx]);
      setSpinning(false);
    }, 4200);
  };

  const cx = 150, cy = 150, r = 138;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Wheel container */}
      <div className="relative select-none">
        {/* Pointer triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0" style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '20px solid #fff',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          }} />
        </div>

        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
              : 'none',
          }}
        >
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={r + 4} fill="white" opacity="0.15" />

          {SEGMENTS.map((seg, i) => {
            const start = i * DEG;
            const end = (i + 1) * DEG;
            const mid = start + DEG / 2;
            const tp = polarXY(cx, cy, r * 0.63, mid);
            const lines = seg.label.split(' ');
            return (
              <g key={i}>
                <path d={wedge(cx, cy, r, start, end)} fill={seg.color} stroke="white" strokeWidth="2" />
                <g transform={`rotate(${mid}, ${tp.x}, ${tp.y})`}>
                  {lines.map((line, li) => (
                    <text
                      key={li}
                      x={tp.x}
                      y={tp.y + (li - (lines.length - 1) / 2) * 13}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="system-ui, sans-serif"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              </g>
            );
          })}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={22} fill="white" />
          <circle cx={cx} cy={cy} r={18} fill="#1E293B" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="16">⚡</text>
        </svg>
      </div>

      {/* Button */}
      {spinsLeft > 0 ? (
        <button
          onClick={spin}
          disabled={spinning}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 text-sm"
        >
          {spinning ? '🎰 Spinning…' : '🎯 Spin to Win!'}
        </button>
      ) : (
        <p className="text-slate-300 text-sm font-medium">Come back tomorrow for a free spin!</p>
      )}
      <p className="text-xs text-slate-400">{spinsLeft} free spin{spinsLeft !== 1 ? 's' : ''} remaining today</p>

      {/* Result banner */}
      {result && (
        <div className="bg-white/15 backdrop-blur border border-white/25 rounded-2xl p-4 text-center w-full max-w-xs">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-white font-bold text-base">You won: {result.reward}!</p>
          {result.code && (
            <div className="mt-2 bg-white/20 rounded-xl px-4 py-1.5 inline-block">
              <p className="text-white/70 text-[10px] uppercase tracking-widest">Your code</p>
              <p className="text-white font-mono font-extrabold text-lg tracking-widest">{result.code}</p>
            </div>
          )}
          {!result.code && result.reward !== 'Better luck tomorrow!' && (
            <p className="text-slate-300 text-xs mt-2">Points credited to your account automatically</p>
          )}
        </div>
      )}
    </div>
  );
}
