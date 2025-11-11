-- Drop the unique constraint on username since we'll handle uniqueness differently
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Recreate the trigger function with better username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  username_count INTEGER;
BEGIN
  -- Get base username from metadata or email
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- Start with the base username
  final_username := base_username;
  username_count := 0;
  
  -- Keep trying with incremented numbers until we find a unique username
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    username_count := username_count + 1;
    final_username := base_username || username_count;
  END LOOP;
  
  -- Insert the profile with unique username
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, final_username);
  
  RETURN new;
END;
$$;