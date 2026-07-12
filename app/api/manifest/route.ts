// app/api/manifest/route.ts
// Serves manifest.json with the sharer's ?ref baked into start_url, so an
// iOS home-screen install (which gets fresh localStorage) still launches
// with the referrer and can record its own edge.
import { NextRequest, NextResponse } from 'next/server';
import manifest from '@/public/manifest.json';

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref') ?? '';

  // device_ids are UUIDs; anything else gets the plain manifest
  const startUrl = /^[\w-]{1,64}$/.test(ref) ? `/?ref=${ref}` : '/';

  return NextResponse.json(
    { ...manifest, start_url: startUrl },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  );
}
