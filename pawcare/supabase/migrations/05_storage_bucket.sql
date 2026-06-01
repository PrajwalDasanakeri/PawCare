-- Create payment_proofs storage bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('payment_proofs', 'payment_proofs', true)
on conflict (id) do nothing;

-- Set up storage policies for payment_proofs
create policy "Anyone can view payment proofs"
  on storage.objects for select
  using ( bucket_id = 'payment_proofs' );

create policy "Authenticated users can upload payment proofs"
  on storage.objects for insert
  with check ( bucket_id = 'payment_proofs' and auth.role() = 'authenticated' );

create policy "Users can update their own payment proofs"
  on storage.objects for update
  using ( bucket_id = 'payment_proofs' and auth.uid() = owner )
  with check ( bucket_id = 'payment_proofs' and auth.role() = 'authenticated' );
