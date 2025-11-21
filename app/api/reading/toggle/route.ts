// app/api/reading/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      device_id,
      activity_date,     // YYYY-MM-DD - when they did it
      lectionary_date,   // MM-DD - which reading
      session,           // 'AM' | 'PM'
      reading_type,      // 'psalm' | 'lesson'
      reference,         // 'Psalm 49'
      translation,       // 'ESV'
      action,            // 'complete' or 'incomplete'
      is_test = false    //  optional flag for test mode
    } = body;

    if (!device_id || !activity_date || !lectionary_date || !session || !reading_type || !reference || !translation || !action) {
      return NextResponse.json({ error: 'missing parameters' }, { status: 400 });
    }

    // Convert lectionary_date (MM-DD) to full date for current year
    const year = new Date().getFullYear();
    const reading_date = `${year}-${lectionary_date}`;

    // Determine desired completion state
    const desiredIsComplete = action === 'complete';

    // 1) Get existing status for this device/reading
    const { data: existing, error: selErr } = await supabaseServer
      .from('user_reading_status')
      .select('is_complete')
      .match({
        device_id,
        reading_date,
        reading_type,
        reference,
        translation,
        session
      })
      .maybeSingle();  // Use maybeSingle() instead of single() to avoid error on no rows

    if (selErr) {
      console.error('Select error:', selErr);
      throw selErr;
    }

    const currentlyComplete = existing?.is_complete ?? false;

    // 2) Determine delta
    let delta = 0;
    if (!currentlyComplete && desiredIsComplete) delta = 1;
    if (currentlyComplete && !desiredIsComplete) delta = -1;

    // 3) Upsert user_reading_status
    const { error: upsertErr } = await supabaseServer
      .from('user_reading_status')
      .upsert({
        device_id,
        reading_date,
        reading_type,
        reference,
        translation,
        session,
        lectionary_date,
        is_complete: desiredIsComplete,
        is_test,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'device_id,reading_date,reading_type,reference,translation,session' 
      });

    if (upsertErr) {
      console.error('Upsert error:', upsertErr);
      throw upsertErr;
    }

    // 4) Insert event log
    const { error: logErr } = await supabaseServer
      .from('reading_activity')
      .insert({
        user_id: null,
        device_id,
        activity_date,
        session,
        reading_type,
        reading_reference: reference,
        translation,
        delta,
        action: delta === 1 ? 'increment' : (delta === -1 ? 'decrement' : 'no-op'),
        lectionary_date,
        is_test
      });

    if (logErr) {
      console.error('Log error:', logErr);
      throw logErr;
    }

    // 5) Update aggregate counts (only if delta != 0)
    if (delta !== 0) {
      const { error: aggErr } = await supabaseServer.rpc('increment_reading_count', {
        p_reading_date: reading_date,
        p_reading_type: reading_type,
        p_reference: reference,
        p_translation: translation,
        p_session: session,
        p_lectionary_date: lectionary_date,
        p_is_test: is_test,
        p_delta: delta
      });

      if (aggErr) {
        console.error('Aggregate error:', aggErr);
        throw aggErr;
      }
    }

    return NextResponse.json({ ok: true, delta });
  } catch (err) {
    console.error('API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'server error', 
      detail: errorMessage 
    }, { status: 500 });
  }
}