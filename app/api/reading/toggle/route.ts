// app/api/reading/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      device_id,
      activity_date,
      lectionary_date,
      session,
      reading_type,
      reference,
      translation,
      action,
      is_test = false
    } = body;

    const { data: authData } = await supabaseServer.auth.getUser();
    const user_id = authData?.user?.id ?? null;

    if (!user_id && !device_id) {
      return NextResponse.json({ error: 'missing identity (user or device)' }, { status: 400 });
    }

    if (!activity_date || !lectionary_date || !session || !reading_type || !reference || !translation || !action) {
      return NextResponse.json({ error: 'missing parameters' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const reading_date = `${year}-${lectionary_date}`;
    const desiredIsComplete = action === 'complete';

    // Call the stored procedure to toggle reading completion
    // using the provided parameters
    // This was not fun to debug, but it works now.
    const { data, error } = await supabaseServer.rpc('toggle_reading_completion', {
      p_user_id: user_id,
      p_device_id: device_id,
      p_activity_date: activity_date,
      p_reading_date: reading_date,
      p_reading_type: reading_type === 'psalms' ? 'psalm' : 'lesson',
      p_reference: reference,
      p_translation: translation,
      p_session: session,
      p_lectionary_date: lectionary_date,
      p_is_test: is_test,
      p_desired_complete: desiredIsComplete
    });

    if (error) throw error;

    return NextResponse.json(data);

  } catch (err) {
    console.error('RAW API ERROR:', err);

    let errorMessage: string;
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (err && typeof err === 'object') {
      try {
        errorMessage = JSON.stringify(err);
      } catch {
        errorMessage = 'Unknown non-serializable error';
      }
    } else {
      errorMessage = String(err);
    }

    return NextResponse.json({
      error: 'server error',
      detail: errorMessage
    }, { status: 500 });
  }
}