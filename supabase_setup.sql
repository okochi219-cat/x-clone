-- Supabase SQL Editor でこれを実行してください

-- tweets テーブル作成
create table if not exists public.tweets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_email text not null,
  content text not null check (char_length(content) <= 280),
  created_at timestamptz default now() not null
);

-- RLS 有効化
alter table public.tweets enable row level security;

-- 全ユーザーが読める
create policy "Anyone can read tweets"
  on public.tweets for select
  using (true);

-- 自分の投稿だけ作成できる
create policy "Authenticated users can insert"
  on public.tweets for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 自分の投稿だけ削除できる
create policy "Users can delete own tweets"
  on public.tweets for delete
  using (auth.uid() = user_id);
