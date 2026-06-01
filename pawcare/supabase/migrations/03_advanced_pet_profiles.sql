-- Clear existing data to allow clean schema update (development only)
truncate table public.bookings cascade;
truncate table public.pets cascade;

-- Drop the existing table (this drops dependent policies and foreign key constraints on other tables)
drop table if exists public.pets cascade;

-- Recreate the pets table with the advanced schema
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  species text not null,
  breed text,
  date_of_birth date,
  weight_kg numeric,
  avatar_url text,
  notes text,
  created_at timestamptz default now()
);

-- Recreate the foreign key constraint on bookings that was dropped
alter table public.bookings 
  add constraint bookings_pet_id_fkey 
  foreign key (pet_id) references public.pets(id) on delete cascade;

-- Create the medical_records table
create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  record_date date not null,
  title text not null,
  description text,
  vet_name text,
  attachments text[],
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.pets enable row level security;
alter table public.medical_records enable row level security;

-- Policies for pets
create policy "Users can view their own pets" on public.pets
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own pets" on public.pets
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own pets" on public.pets
  for update using (auth.uid() = owner_id);

create policy "Users can delete their own pets" on public.pets
  for delete using (auth.uid() = owner_id);

create policy "Admins can view all pets" on public.pets
  for select using (public.is_admin());

-- Policies for medical_records
create policy "Users can view their pets' medical records" on public.medical_records
  for select using (
    exists (
      select 1 from public.pets
      where pets.id = medical_records.pet_id and pets.owner_id = auth.uid()
    )
  );

create policy "Users can insert their pets' medical records" on public.medical_records
  for insert with check (
    exists (
      select 1 from public.pets
      where pets.id = pet_id and pets.owner_id = auth.uid()
    )
  );

create policy "Users can update their pets' medical records" on public.medical_records
  for update using (
    exists (
      select 1 from public.pets
      where pets.id = medical_records.pet_id and pets.owner_id = auth.uid()
    )
  );

create policy "Users can delete their pets' medical records" on public.medical_records
  for delete using (
    exists (
      select 1 from public.pets
      where pets.id = medical_records.pet_id and pets.owner_id = auth.uid()
    )
  );

create policy "Admins can view all medical records" on public.medical_records
  for select using (public.is_admin());
