-- Add unique constraint to utr_number in bookings table
alter table public.bookings add constraint bookings_utr_number_key unique (utr_number);
