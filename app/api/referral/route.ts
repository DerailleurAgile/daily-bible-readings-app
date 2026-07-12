// app/api/referral/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrer_device_id, recipient_device_id, installed = false, is_test = false } = body;

    if (!recipient_device_id) {
      return NextResponse.json({ error: 'missing recipient_device_id' }, { status: 400 });
    }

    if (installed) {
      // Stamp install time on an existing edge; no-op for organic installs.
      const { error } = await supabaseServer
        .from('share_referrals')
        .update({ installed_at: new Date().toISOString() })
        .eq('recipient_device_id', recipient_device_id)
        .is('installed_at', null);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (!referrer_device_id || referrer_device_id === recipient_device_id) {
      return NextResponse.json({ error: 'invalid referrer_device_id' }, { status: 400 });
    }

    // First referral wins; repeat scans are ignored.
    const { error } = await supabaseServer
      .from('share_referrals')
      .upsert(
        { referrer_device_id, recipient_device_id, is_test },
        { onConflict: 'recipient_device_id', ignoreDuplicates: true }
      );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('REFERRAL API ERROR:', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'server error', detail }, { status: 500 });
  }
}
