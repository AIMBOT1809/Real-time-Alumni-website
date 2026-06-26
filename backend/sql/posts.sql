create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  content text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('admin','alumni')) not null
);

alter table public.posts enable row level security;
create policy "public read" on public.posts for select using (true);
create policy "admin/alumni insert" on public.posts for insert with check (auth.uid() = user_id and role in ('admin','alumni'));
