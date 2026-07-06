
-- Restrict public listing: replace broad public read with owner-only listing + keep direct file URLs working
drop policy if exists "rooms_public_read" on storage.objects;
create policy "rooms_owner_select" on storage.objects for select
  using (bucket_id = 'rooms' and auth.uid()::text = (storage.foldername(name))[1]);

-- Restrict trigger function execution
revoke execute on function public.handle_new_user() from public, anon, authenticated;
