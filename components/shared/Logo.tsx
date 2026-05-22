'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
}

export function Logo({ size = 'md', onDark = false }: LogoProps) {
  const iconBox = size === 'sm' ? 'h-8 w-8 rounded-lg' : size === 'lg' ? 'h-13 w-13 rounded-2xl' : 'h-10 w-10 rounded-xl';
  const zapIcon = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  const brandText = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const tagText = 'text-[10px] tracking-[0.2em] uppercase';
  const nameColor = onDark ? 'text-white' : 'text-slate-800';
  const tagColor = onDark ? 'text-slate-400' : 'text-slate-400';

  return (
    <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      {/* Icon mark */}
      <div
        className={`${iconBox} bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300`}
      >
        <Zap className={`${zapIcon} text-white fill-white`} />
      </div>

      {/* Word mark */}
      <div className="flex flex-col leading-none">
        <span className={`${brandText} font-extrabold ${nameColor} tracking-tight`}>
          Fresh<span className="text-orange-500">Talent</span>
        </span>
        <span className={`${tagText} ${tagColor} font-medium mt-0.5`}>Store</span>
      </div>
    </Link>
  );
}
