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
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  pet_name text not null,
  pet_type text not null,
  age int not null,
  notes text,
  created_at timestamptz default now()
);

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  pet_id uuid references public.pets(id) on delete cascade not null,
  service text check (service in ('Grooming', 'Vet Consultation', 'Boarding', 'Training')) not null,
  booking_date timestamptz not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'rejected')),
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
  for select using (auth.uid() = user_id);

create policy "Users can insert their own pets" on public.pets
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own pets" on public.pets
  for update using (auth.uid() = user_id);

create policy "Users can delete their own pets" on public.pets
  for delete using (auth.uid() = user_id);

create policy "Admins can view all pets" on public.pets
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
