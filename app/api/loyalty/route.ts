import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const POINTS_VALUE_RWF = 10; // 1 point = 10 RWF when redeeming
const POINTS_PER_1000_RWF = 1; // earn 1 point per 1000 RWF spent

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000,
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

export function getTier(points: number): Tier {
  if (points >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (points >= TIER_THRESHOLDS.gold) return 'gold';
  if (points >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

export function pointsToRwf(points: number) {
  return points * POINTS_VALUE_RWF;
}

export function rwfToPoints(rwf: number) {
  return Math.floor(rwf / 1000) * POINTS_PER_1000_RWF;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// GET /api/loyalty — returns balance, tier, and transaction history
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: loyaltyRow }, { data: transactions }] = await Promise.all([
    supabase
      .from('loyalty_points')
      .select('points, tier')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const points = loyaltyRow?.points ?? 0;
  const tier = getTier(points);
  const nextTier = tier === 'platinum' ? null : Object.keys(TIER_THRESHOLDS).find(t => TIER_THRESHOLDS[t as Tier] > points) as Tier | null;
  const pointsToNextTier = nextTier ? TIER_THRESHOLDS[nextTier] - points : null;

  return NextResponse.json({
    points,
    tier,
    nextTier,
    pointsToNextTier,
    redeemValueRwf: pointsToRwf(points),
    transactions: transactions ?? [],
  });
}

// POST /api/loyalty — award points after purchase or redeem points at checkout
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, orderId, orderTotal, pointsToRedeem } = await request.json();

  if (action === 'award') {
    const earned = rwfToPoints(orderTotal);
    if (earned <= 0) return NextResponse.json({ success: true, earned: 0 });

    await supabase.from('loyalty_points').upsert({
      user_id: user.id,
      points: earned,
      tier: getTier(earned),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    });

    // Increment existing points
    const { data: existing } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      const newTotal = existing.points + earned;
      await supabase
        .from('loyalty_points')
        .update({ points: newTotal, tier: getTier(newTotal), updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    await supabase.from('points_transactions').insert({
      user_id: user.id,
      points: earned,
      type: 'earned',
      reference_id: String(orderId),
      description: `Earned from order #${orderId}`,
    });

    return NextResponse.json({ success: true, earned });
  }

  if (action === 'redeem') {
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return NextResponse.json({ error: 'Invalid points amount' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('user_id', user.id)
      .single();

    const available = existing?.points ?? 0;
    if (available < pointsToRedeem) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    const newTotal = available - pointsToRedeem;
    await supabase
      .from('loyalty_points')
      .update({ points: newTotal, tier: getTier(newTotal), updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    await supabase.from('points_transactions').insert({
      user_id: user.id,
      points: -pointsToRedeem,
      type: 'redeemed',
      reference_id: orderId ? String(orderId) : null,
      description: `Redeemed ${pointsToRedeem} points`,
    });

    return NextResponse.json({ success: true, discountRwf: pointsToRwf(pointsToRedeem), remainingPoints: newTotal });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
