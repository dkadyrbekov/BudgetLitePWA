create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  comment text,
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.expenses enable row level security;

create policy "users can read categories"
on public.categories
for select
using (auth.uid() = user_id);

create policy "users can insert categories"
on public.categories
for insert
with check (auth.uid() = user_id);

create policy "users can update categories"
on public.categories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete categories"
on public.categories
for delete
using (auth.uid() = user_id);

create policy "users can read expenses"
on public.expenses
for select
using (auth.uid() = user_id);

create policy "users can insert expenses"
on public.expenses
for insert
with check (auth.uid() = user_id);

create policy "users can update expenses"
on public.expenses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete expenses"
on public.expenses
for delete
using (auth.uid() = user_id);
