
-- Update existing escort profiles to be active if they have basic information
UPDATE public.profiles 
SET is_active = true, updated_at = now()
WHERE role IN ('escort', 'agency') 
  AND display_name IS NOT NULL 
  AND display_name != ''
  AND location IS NOT NULL 
  AND location != '';

-- Mark some profiles as featured for the featured section (using subquery instead of LIMIT)
UPDATE public.profiles 
SET featured = true, updated_at = now()
WHERE id IN (
  SELECT id FROM public.profiles 
  WHERE role IN ('escort', 'agency') 
    AND is_active = true
    AND profile_picture IS NOT NULL
    AND profile_picture != ''
    AND display_name IS NOT NULL
    AND display_name != ''
    AND location IS NOT NULL
    AND location != ''
  ORDER BY rating DESC NULLS LAST, created_at DESC
  LIMIT 3
);

-- Ensure profiles with good completion are approved
UPDATE public.profiles 
SET status = 'approved', updated_at = now()
WHERE role IN ('escort', 'agency') 
  AND is_active = true
  AND profile_completion_percentage >= 50;
