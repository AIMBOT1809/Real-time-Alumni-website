-- 1. Follow Requests Table
create table if not exists public.follow_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  status text default 'pending',
  created_at timestamp default now()
);

-- 2. Chats Table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now()
);

-- 3. Chat Members Table
create table if not exists public.chat_members (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references auth.users(id)
);

-- 4. Messages Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  sender_id uuid references auth.users(id),
  content text,
  created_at timestamp default now()
);
