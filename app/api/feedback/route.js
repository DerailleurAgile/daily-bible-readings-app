// /app/api/feedback/route.js
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req) {
  const {
    message,
    userId,
    user_agent,
    device_type,
    os_name,
    os_version,
    browser
  } = await req.json();

  if (!message) {
    return new Response(
      JSON.stringify({ error: 'Message is required' }),
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from('feedback')
    .insert([{
      message,
      user_id: userId || null,
      user_agent: user_agent || null,
      device_type: device_type || null,
      os_name: os_name || null,
      os_version: os_version || null,
      browser: browser || null
    }]);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
}
