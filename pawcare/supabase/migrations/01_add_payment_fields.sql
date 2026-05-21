-- Add payment tracking fields to bookings table
alter table public.bookings 
  add column payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  add column payment_method text,
  add column payment_amount numeric,
  add column transaction_id text,
  add column paid_at timestamptz;

-- Allow users to update their own bookings to mark them as paid
create policy "Users can update their own bookings" on public.bookings
  for update using (auth.uid() = user_id);
