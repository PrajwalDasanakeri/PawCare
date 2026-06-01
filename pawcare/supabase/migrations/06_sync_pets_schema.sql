-- Migration to sync remote pets schema with frontend structure

-- Rename columns
ALTER TABLE public.pets RENAME COLUMN user_id TO owner_id;
ALTER TABLE public.pets RENAME COLUMN pet_name TO name;
ALTER TABLE public.pets RENAME COLUMN pet_type TO species;

-- Add new columns
ALTER TABLE public.pets ADD COLUMN breed text;
ALTER TABLE public.pets ADD COLUMN date_of_birth date;
ALTER TABLE public.pets ADD COLUMN weight_kg numeric;
ALTER TABLE public.pets ADD COLUMN avatar_url text;

-- Drop old column if it exists safely
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pets' 
        AND column_name = 'age'
    ) THEN
        ALTER TABLE public.pets DROP COLUMN age;
    END IF;
END $$;

-- Update RLS policies to use owner_id
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

CREATE POLICY "Users can view their own pets" ON public.pets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own pets" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets" ON public.pets
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets" ON public.pets
  FOR DELETE USING (auth.uid() = owner_id);
