-- Add new payment verification fields to bookings
alter table public.bookings 
  add column utr_number text,
  add column screenshot_url text,
  add column verified_by uuid references public.users(id),
  add column verified_at timestamptz,
  add column rejection_reason text;

-- Update the payment_status check constraint to include 'verification_pending'
-- First, drop the old constraint
alter table public.bookings drop constraint if exists bookings_payment_status_check;

-- Add the new constraint
alter table public.bookings add constraint bookings_payment_status_check 
  check (payment_status in ('pending', 'verification_pending', 'paid', 'failed', 'rejected'));

-- Create the payment_proofs storage bucket
insert into storage.buckets (id, name, public) 
values ('payment_proofs', 'payment_proofs', true)
on conflict (id) do nothing;

-- Storage policies for payment_proofs
create policy "Authenticated users can upload payment proofs"
on storage.objects for insert
with check (
  bucket_id = 'payment_proofs' and
  auth.role() = 'authenticated'
);

create policy "Anyone can view payment proofs"
on storage.objects for select
using (bucket_id = 'payment_proofs');

create policy "Users can update their own payment proofs"
on storage.objects for update
using (
  bucket_id = 'payment_proofs' and
  auth.role() = 'authenticated'
);

-- Function to prevent non-admins from setting payment_status to 'paid'
create or replace function public.prevent_unauthorized_payment_verification()
returns trigger as $$
begin
  -- Check if payment_status is being changed to 'paid'
  if new.payment_status = 'paid' and old.payment_status is distinct from 'paid' then
    -- Check if the current user is an admin
    if not public.is_admin() then
      raise exception 'Only administrators can verify and approve payments.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function before update
drop trigger if exists enforce_payment_verification_security on public.bookings;
create trigger enforce_payment_verification_security
  before update on public.bookings
  for each row execute procedure public.prevent_unauthorized_payment_verification();
