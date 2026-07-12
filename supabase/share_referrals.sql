-- share_referrals.sql
-- Records who shared the app with whom (by device_id) so the spread can be
-- reconstructed as a graph. One row per recipient = one parent per device,
-- so the table is already a tree; edges are (referrer -> recipient).
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.share_referrals (
  recipient_device_id text PRIMARY KEY,          -- first scan wins
  referrer_device_id  text NOT NULL,
  opened_at    timestamptz NOT NULL DEFAULT now(), -- first open via shared link
  installed_at timestamptz,                        -- first standalone launch, null if never installed
  is_test boolean NOT NULL DEFAULT false
);

-- No policies: only the service role (API routes) may touch this table.
ALTER TABLE public.share_referrals ENABLE ROW LEVEL SECURITY;
