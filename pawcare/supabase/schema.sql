-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create tables
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

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

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  pet_id uuid references public.pets(id) on delete cascade not null,
  service text check (service in ('Grooming', 'Vet Consultation', 'Boarding', 'Training')) not null,
  booking_date timestamptz not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'rejected')),
  payment_status text default 'pending' check (payment_status in ('pending', 'verification_pending', 'paid', 'failed', 'rejected')),
  payment_method text,
  payment_amount numeric,
  transaction_id text,
  paid_at timestamptz,
  utr_number text unique,
  screenshot_url text,
  verified_by uuid references public.users(id),
  verified_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.pets enable row level security;
alter table public.medical_records enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Admin check function
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.users
  for select using (public.is_admin());

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

-- Policies for bookings
create policy "Users can view their own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all bookings" on public.bookings
  for select using (public.is_admin());

create policy "Admins can update any booking" on public.bookings
  for update using (public.is_admin());

create policy "Users can update their own bookings" on public.bookings
  for update using (auth.uid() = user_id);

-- Policies for reviews
create policy "Anyone can view reviews" on public.reviews
  for select using (true);

create policy "Authenticated users can insert reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Trigger for new user
create or replace function public.handle_new_user()
returns trigger as $$
declare
  username text;
begin
  -- Get name from metadata, fallback to email prefix
  username := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  
  insert into public.users (id, name, email, role)
  values (new.id, username, new.email, 'customer')
  on conflict (id) do update 
  set name = excluded.name, 
      email = excluded.email;
      
  return new;
end;
$$ language plpgsql security definer;

-- Ensure the trigger is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for payment verification security
create or replace function public.prevent_unauthorized_payment_verification()
returns trigger as $$
begin
  if new.payment_status = 'paid' and old.payment_status is distinct from 'paid' then
    if not public.is_admin() then
      raise exception 'Only administrators can verify and approve payments.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_payment_verification_security on public.bookings;
create trigger enforce_payment_verification_security
  before update on public.bookings
  for each row execute procedure public.prevent_unauthorized_payment_verification();
