
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Designs
create table public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_type text not null,
  style text not null,
  color_theme text,
  prompt text,
  original_url text not null,
  generated_url text not null,
  saved boolean not null default true,
  created_at timestamptz not null default now()
);
create index designs_user_id_idx on public.designs(user_id, created_at desc);
alter table public.designs enable row level security;
create policy "designs_select_own" on public.designs for select using (auth.uid() = user_id);
create policy "designs_insert_own" on public.designs for insert with check (auth.uid() = user_id);
create policy "designs_update_own" on public.designs for update using (auth.uid() = user_id);
create policy "designs_delete_own" on public.designs for delete using (auth.uid() = user_id);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('rooms', 'rooms', true)
on conflict (id) do nothing;

create policy "rooms_public_read" on storage.objects for select using (bucket_id = 'rooms');
create policy "rooms_user_insert" on storage.objects for insert
  with check (bucket_id = 'rooms' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "rooms_user_update" on storage.objects for update
  using (bucket_id = 'rooms' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "rooms_user_delete" on storage.objects for delete
  using (bucket_id = 'rooms' and auth.uid()::text = (storage.foldername(name))[1]);
