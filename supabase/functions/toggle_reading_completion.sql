-- toggle_reading_completion.sql
-- Atomically handles reading completion toggle with state tracking
-- Created: 2024-11-24
-- Version: 0.5.0-alpha

-- Main function that handles the entire toggle atomically
CREATE OR REPLACE FUNCTION public.toggle_reading_completion(
  p_user_id uuid,
  p_device_id text,
  p_activity_date date,
  p_reading_date date,
  p_reading_type text,
  p_reference text,
  p_translation text,
  p_session text,
  p_lectionary_date text,
  p_is_test boolean,
  p_desired_complete boolean
)
RETURNS jsonb
LANGUAGE plpgsql
AS 
'
DECLARE
  v_was_complete boolean := false;
  v_delta integer;
  v_action text;
  v_existing_record record;
BEGIN
  -- Step 1: Check if record exists and get current state
  SELECT is_complete INTO v_existing_record
  FROM user_reading_status
  WHERE COALESCE(user_id::text, device_id) = COALESCE(p_user_id::text, p_device_id)
    AND reading_date = p_reading_date
    AND reading_type = p_reading_type
    AND reference = p_reference
    AND translation = p_translation
    AND session = p_session;
  
  IF FOUND THEN
    v_was_complete := v_existing_record.is_complete;
  END IF;
  
  -- Step 2: Upsert the record
  INSERT INTO user_reading_status (
    user_id,
    device_id,
    reading_date,
    reading_type,
    reference,
    translation,
    session,
    lectionary_date,
    is_complete,
    is_test,
    updated_at
  )
  VALUES (
    p_user_id,
    p_device_id,
    p_reading_date,
    p_reading_type,
    p_reference,
    p_translation,
    p_session,
    p_lectionary_date,
    p_desired_complete,
    p_is_test,
    NOW()
  )
  ON CONFLICT (COALESCE(user_id::text, device_id), reading_date, reading_type, reference, translation, session)
  DO UPDATE SET
    is_complete = p_desired_complete,
    updated_at = NOW();
  
  -- Step 3: Calculate delta based on state transition
  IF v_was_complete = false AND p_desired_complete = true THEN
    v_delta := 1;
    v_action := ''increment'';
  ELSIF v_was_complete = true AND p_desired_complete = false THEN
    v_delta := -1;
    v_action := ''decrement'';
  ELSE
    v_delta := 0;
    v_action := ''no-op'';
  END IF;
  
  -- Step 3: Log activity
  INSERT INTO reading_activity (
    user_id,
    device_id,
    activity_date,
    session,
    reading_type,
    reading_reference,
    translation,
    delta,
    action,
    lectionary_date,
    is_test
  )
  VALUES (
    p_user_id,
    p_device_id,
    p_activity_date,
    p_session,
    p_reading_type,
    p_reference,
    p_translation,
    v_delta,
    v_action,
    p_lectionary_date,
    p_is_test
  );
  
  -- Step 4: Update aggregate counts (only if delta != 0)
  IF v_delta != 0 THEN
    INSERT INTO reading_daily_counts (
      id,
      reading_date,
      reading_type,
      reference,
      translation,
      session,
      lectionary_date,
      is_test,
      total_count,
      last_updated
    )
    VALUES (
      gen_random_uuid(),
      p_reading_date,
      p_reading_type,
      p_reference,
      p_translation,
      p_session,
      p_lectionary_date,
      p_is_test,
      GREATEST(v_delta, 0),
      NOW()
    )
    ON CONFLICT (reading_date, reading_type, reference, translation, session, lectionary_date, is_test)
    DO UPDATE SET
      total_count = GREATEST(reading_daily_counts.total_count + v_delta, 0),
      last_updated = NOW();
  END IF;
  
  -- Return result
  RETURN jsonb_build_object(
    ''ok'', true,
    ''delta'', v_delta,
    ''was_complete'', v_was_complete,
    ''now_complete'', p_desired_complete
  );
END;
';