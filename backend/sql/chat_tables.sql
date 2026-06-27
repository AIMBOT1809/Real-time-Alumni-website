-- Connection Requests Table
create table if not exists public.connection_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations Table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversation Participants Table
create table if not exists public.conversation_participants (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(conversation_id, user_id)
);

-- Messages Table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  attachment_url text,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Enable Row Level Security
alter table public.connection_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Connection Requests Policies
create policy "users_can_view_own_requests" on public.connection_requests
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "users_can_create_requests" on public.connection_requests
  for insert with check (auth.uid() = sender_id);

create policy "users_can_update_own_requests" on public.connection_requests
  for update using (auth.uid() = receiver_id);

-- Conversations Policies
create policy "participants_can_view" on public.conversations
  for select using (
    exists(
      select 1 from public.conversation_participants
      where conversation_id = id and user_id = auth.uid()
    )
  );

-- Conversation Participants Policies
create policy "participants_can_view" on public.conversation_participants
  for select using (
    auth.uid() = user_id or
    exists(
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "participants_can_insert" on public.conversation_participants
  for insert with check (true);

-- Messages Policies
create policy "participants_can_view_messages" on public.messages
  for select using (
    exists(
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

create policy "participants_can_insert_messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists(
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

create policy "participants_can_update_read_at" on public.messages
  for update using (
    exists(
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index if not exists idx_connection_requests_receiver on public.connection_requests(receiver_id);
create index if not exists idx_connection_requests_sender on public.connection_requests(sender_id);
create index if not exists idx_connection_requests_status on public.connection_requests(status);
create index if not exists idx_conversation_participants_user on public.conversation_participants(user_id);
create index if not exists idx_conversation_participants_conversation on public.conversation_participants(conversation_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
