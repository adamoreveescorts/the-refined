
-- Add incall and outcall rate columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS incall_hourly_rate text,
ADD COLUMN IF NOT EXISTS outcall_hourly_rate text,
ADD COLUMN IF NOT EXISTS incall_two_hour_rate text,
ADD COLUMN IF NOT EXISTS outcall_two_hour_rate text,
ADD COLUMN IF NOT EXISTS incall_dinner_rate text,
ADD COLUMN IF NOT EXISTS outcall_dinner_rate text,
ADD COLUMN IF NOT EXISTS incall_overnight_rate text,
ADD COLUMN IF NOT EXISTS outcall_overnight_rate text;

-- Update Bangkok profiles with incall/outcall rates based on area prestige
-- Premium areas (Sukhumvit, Silom, Sathorn, Ratchadamri, Ploenchit, Chitlom, Wireless Road)
UPDATE public.profiles 
SET 
  incall_hourly_rate = CASE 
    WHEN hourly_rate IS NOT NULL AND hourly_rate != '' THEN 
      ROUND(regexp_replace(hourly_rate, '[^\d]', '', 'g')::numeric * 0.85)::text
    ELSE NULL
  END,
  outcall_hourly_rate = CASE 
    WHEN hourly_rate IS NOT NULL AND hourly_rate != '' THEN 
      ROUND(regexp_replace(hourly_rate, '[^\d]', '', 'g')::numeric * 1.1)::text
    ELSE NULL
  END,
  incall_two_hour_rate = CASE 
    WHEN two_hour_rate IS NOT NULL AND two_hour_rate != '' THEN 
      ROUND(regexp_replace(two_hour_rate, '[^\d]', '', 'g')::numeric * 0.85)::text
    ELSE NULL
  END,
  outcall_two_hour_rate = CASE 
    WHEN two_hour_rate IS NOT NULL AND two_hour_rate != '' THEN 
      ROUND(regexp_replace(two_hour_rate, '[^\d]', '', 'g')::numeric * 1.1)::text
    ELSE NULL
  END,
  incall_dinner_rate = CASE 
    WHEN dinner_rate IS NOT NULL AND dinner_rate != '' THEN 
      ROUND(regexp_replace(dinner_rate, '[^\d]', '', 'g')::numeric * 0.85)::text
    ELSE NULL
  END,
  outcall_dinner_rate = CASE 
    WHEN dinner_rate IS NOT NULL AND dinner_rate != '' THEN 
      ROUND(regexp_replace(dinner_rate, '[^\d]', '', 'g')::numeric * 1.1)::text
    ELSE NULL
  END,
  incall_overnight_rate = CASE 
    WHEN overnight_rate IS NOT NULL AND overnight_rate != '' THEN 
      ROUND(regexp_replace(overnight_rate, '[^\d]', '', 'g')::numeric * 0.85)::text
    ELSE NULL
  END,
  outcall_overnight_rate = CASE 
    WHEN overnight_rate IS NOT NULL AND overnight_rate != '' THEN 
      ROUND(regexp_replace(overnight_rate, '[^\d]', '', 'g')::numeric * 1.1)::text
    ELSE NULL
  END
WHERE location ILIKE '%bangkok%' 
  AND (location ILIKE '%sukhumvit%' OR location ILIKE '%silom%' OR location ILIKE '%sathorn%' 
       OR location ILIKE '%ratchadamri%' OR location ILIKE '%ploenchit%' OR location ILIKE '%chitlom%' 
       OR location ILIKE '%wireless road%');

-- Mid-tier Bangkok areas (Phrom Phong, Thonglor, Asok, Ekkamai, etc.)
UPDATE public.profiles 
SET 
  incall_hourly_rate = CASE 
    WHEN hourly_rate IS NOT NULL AND hourly_rate != '' THEN 
      ROUND(regexp_replace(hourly_rate, '[^\d]', '', 'g')::numeric * 0.88)::text
    ELSE NULL
  END,
  outcall_hourly_rate = CASE 
    WHEN hourly_rate IS NOT NULL AND hourly_rate != '' THEN 
      ROUND(regexp_replace(hourly_rate, '[^\d]', '', 'g')::numeric * 1.05)::text
    ELSE NULL
  END,
  incall_two_hour_rate = CASE 
    WHEN two_hour_rate IS NOT NULL AND two_hour_rate != '' THEN 
      ROUND(regexp_replace(two_hour_rate, '[^\d]', '', 'g')::numeric * 0.88)::text
    ELSE NULL
  END,
  outcall_two_hour_rate = CASE 
    WHEN two_hour_rate IS NOT NULL AND two_hour_rate != '' THEN 
      ROUND(regexp_replace(two_hour_rate, '[^\d]', '', 'g')::numeric * 1.05)::text
    ELSE NULL
  END,
  incall_dinner_rate = CASE 
    WHEN dinner_rate IS NOT NULL AND dinner_rate != '' THEN 
      ROUND(regexp_replace(dinner_rate, '[^\d]', '', 'g')::numeric * 0.88)::text
    ELSE NULL
  END,
  outcall_dinner_rate = CASE 
    WHEN dinner_rate IS NOT NULL AND dinner_rate != '' THEN 
      ROUND(regexp_replace(dinner_rate, '[^\d]', '', 'g')::numeric * 1.05)::text
    ELSE NULL
  END,
  incall_overnight_rate = CASE 
    WHEN overnight_rate IS NOT NULL AND overnight_rate != '' THEN 
      ROUND(regexp_replace(overnight_rate, '[^\d]', '', 'g')::numeric * 0.88)::text
    ELSE NULL
  END,
  outcall_overnight_rate = CASE 
    WHEN overnight_rate IS NOT NULL AND overnight_rate != '' THEN 
      ROUND(regexp_replace(overnight_rate, '[^\d]', '', 'g')::numeric * 1.05)::text
    ELSE NULL
  END
WHERE location ILIKE '%bangkok%' 
  AND (location ILIKE '%phrom phong%' OR location ILIKE '%thonglor%' OR location ILIKE '%asok%' 
       OR location ILIKE '%ekkamai%' OR location ILIKE '%pratunam%' OR location ILIKE '%ratchathewi%');

-- Outer Bangkok areas (On Nut, Lat Phrao, Victory Monument, etc.)
UPDATE public.profiles 
SET 
  incall_hourly_rate = CASE 
    WHEN hourly_rate IS NOT NULL AND hourly_rate != '' THEN 
      ROUND(regexp_replace(hourly_rate, '[^\d]', '', 'g')::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_hourly_rate = CASE 
    WHEN hourly_rate IS NOT NULL AND hourly_rate != '' THEN 
      regexp_replace(hourly_rate, '[^\d]', '', 'g')
    ELSE NULL
  END,
  incall_two_hour_rate = CASE 
    WHEN two_hour_rate IS NOT NULL AND two_hour_rate != '' THEN 
      ROUND(regexp_replace(two_hour_rate, '[^\d]', '', 'g')::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_two_hour_rate = CASE 
    WHEN two_hour_rate IS NOT NULL AND two_hour_rate != '' THEN 
      regexp_replace(two_hour_rate, '[^\d]', '', 'g')
    ELSE NULL
  END,
  incall_dinner_rate = CASE 
    WHEN dinner_rate IS NOT NULL AND dinner_rate != '' THEN 
      ROUND(regexp_replace(dinner_rate, '[^\d]', '', 'g')::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_dinner_rate = CASE 
    WHEN dinner_rate IS NOT NULL AND dinner_rate != '' THEN 
      regexp_replace(dinner_rate, '[^\d]', '', 'g')
    ELSE NULL
  END,
  incall_overnight_rate = CASE 
    WHEN overnight_rate IS NOT NULL AND overnight_rate != '' THEN 
      ROUND(regexp_replace(overnight_rate, '[^\d]', '', 'g')::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_overnight_rate = CASE 
    WHEN overnight_rate IS NOT NULL AND overnight_rate != '' THEN 
      regexp_replace(overnight_rate, '[^\d]', '', 'g')
    ELSE NULL
  END
WHERE location ILIKE '%bangkok%' 
  AND incall_hourly_rate IS NULL;

-- Update non-Bangkok profiles by parsing rates text and converting to incall/outcall
UPDATE public.profiles 
SET 
  incall_hourly_rate = CASE 
    WHEN rates ~ '\$(\d+)\/hour' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/hour.*', '\1', 'g'))::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_hourly_rate = CASE 
    WHEN rates ~ '\$(\d+)\/hour' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/hour.*', '\1', 'g'))::numeric * 1.1)::text
    ELSE NULL
  END,
  incall_overnight_rate = CASE 
    WHEN rates ~ '\$(\d+)\/overnight' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/overnight.*', '\1', 'g'))::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_overnight_rate = CASE 
    WHEN rates ~ '\$(\d+)\/overnight' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/overnight.*', '\1', 'g'))::numeric * 1.1)::text
    ELSE NULL
  END,
  incall_dinner_rate = CASE 
    WHEN rates ~ '\$(\d+)\/dinner' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/dinner.*', '\1', 'g'))::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_dinner_rate = CASE 
    WHEN rates ~ '\$(\d+)\/dinner' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/dinner.*', '\1', 'g'))::numeric * 1.1)::text
    ELSE NULL
  END,
  incall_two_hour_rate = CASE 
    WHEN rates ~ '\$(\d+)\/2\s*hours?' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/2\s*hours?.*', '\1', 'g'))::numeric * 0.9)::text
    ELSE NULL
  END,
  outcall_two_hour_rate = CASE 
    WHEN rates ~ '\$(\d+)\/2\s*hours?' THEN 
      ROUND((regexp_replace(rates, '.*\$(\d+)\/2\s*hours?.*', '\1', 'g'))::numeric * 1.1)::text
    ELSE NULL
  END
WHERE location NOT ILIKE '%bangkok%' 
  AND rates IS NOT NULL 
  AND rates != '';
