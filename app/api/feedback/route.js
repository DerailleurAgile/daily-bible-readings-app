// /app/api/feedback/route.js
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req) {
  const { message, userId } = await req.json();

  if (!message) {
    return new Response(
      JSON.stringify({ error: 'Message is required' }),
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from('feedback')
    .insert({ message, user_id: userId || null });

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
