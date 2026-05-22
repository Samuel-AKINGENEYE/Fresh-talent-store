'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, TrendingUp, Award } from 'lucide-react';

interface Transaction {
  id: number;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  description: string;
  created_at: string;
}

interface LoyaltyData {
  points: number;
  tier: string;
  nextTier: string | null;
  pointsToNextTier: number | null;
  redeemValueRwf: number;
  transactions: Transaction[];
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  silver: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300' },
  gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  platinum: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
};

const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0, silver: 1000, gold: 5000, platinum: 10000,
};

export default function LoyaltyCard() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const res = await fetch('/api/loyalty', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6 animate-pulse h-48" />;
  }

  if (!data) return null;

  const tier = data.tier;
  const colors = TIER_COLORS[tier] ?? TIER_COLORS.bronze;
  const tierCurrent = TIER_THRESHOLDS[tier] ?? 0;
  const tierNext = data.nextTier ? TIER_THRESHOLDS[data.nextTier] : null;
  const progressPct = tierNext
    ? Math.min(100, ((data.points - tierCurrent) / (tierNext - tierCurrent)) * 100)
    : 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        Loyalty Points
      </h3>

      {/* Tier badge + points */}
      <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 mb-4`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Your Balance</p>
            <p className="text-3xl font-bold">{data.points.toLocaleString()}</p>
            <p className="text-sm text-gray-500">≈ RWF {data.redeemValueRwf.toLocaleString()} value</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border}`}>
            <div className="flex items-center gap-1">
              <Award className={`h-4 w-4 ${colors.text}`} />
              <span className={`text-sm font-semibold capitalize ${colors.text}`}>{tier}</span>
            </div>
          </div>
        </div>

        {data.nextTier && data.pointsToNextTier !== null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{data.points} pts</span>
              <span className="capitalize">{data.nextTier} at {TIER_THRESHOLDS[data.nextTier].toLocaleString()} pts</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  tier === 'bronze' ? 'bg-amber-500' :
                  tier === 'silver' ? 'bg-gray-400' :
                  tier === 'gold' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{data.pointsToNextTier} more points to {data.nextTier}</p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">How to earn</span>
        </div>
        <p>Earn 1 point for every RWF 1,000 spent. Redeem 100 points for RWF 1,000 off your next order.</p>
      </div>

      {/* Recent transactions */}
      {data.transactions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          <div className="space-y-2">
            {data.transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-700">{tx.description}</p>
                  <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.transactions.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">No transactions yet. Start shopping to earn points!</p>
      )}
    </div>
  );
}
