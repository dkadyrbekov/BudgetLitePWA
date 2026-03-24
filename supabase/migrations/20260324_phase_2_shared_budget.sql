create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_not_blank check (char_length(trim(name)) > 0),
  constraint categories_name_unique unique (name)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12, 2) not null,
  category_id uuid references public.categories (id) on delete set null,
  category_name_snapshot text not null,
  category_icon_snapshot text,
  category_color_snapshot text,
  description text,
  expense_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint expenses_amount_positive check (amount > 0),
  constraint expenses_description_not_blank check (
    description is null or char_length(trim(description)) > 0
  ),
  constraint expenses_category_name_snapshot_not_blank check (
    char_length(trim(category_name_snapshot)) > 0
  )
);

create table public.incomes (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12, 2) not null,
  description text,
  income_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint incomes_amount_positive check (amount > 0),
  constraint incomes_description_not_blank check (
    description is null or char_length(trim(description)) > 0
  )
);

create index categories_name_idx on public.categories (name);
create index expenses_expense_date_idx on public.expenses (expense_date desc);
create index expenses_category_id_idx on public.expenses (category_id);
create index incomes_income_date_idx on public.incomes (income_date desc);

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger set_expenses_updated_at
before update on public.expenses
for each row
execute function public.set_updated_at();

create trigger set_incomes_updated_at
before update on public.incomes
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.incomes enable row level security;

create policy "Authenticated users can read categories"
on public.categories
for select
to authenticated
using (true);

create policy "Authenticated users can insert categories"
on public.categories
for insert
to authenticated
with check (true);

create policy "Authenticated users can update categories"
on public.categories
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete categories"
on public.categories
for delete
to authenticated
using (true);

create policy "Authenticated users can read expenses"
on public.expenses
for select
to authenticated
using (true);

create policy "Authenticated users can insert expenses"
on public.expenses
for insert
to authenticated
with check (true);

create policy "Authenticated users can update expenses"
on public.expenses
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete expenses"
on public.expenses
for delete
to authenticated
using (true);

create policy "Authenticated users can read incomes"
on public.incomes
for select
to authenticated
using (true);

create policy "Authenticated users can insert incomes"
on public.incomes
for insert
to authenticated
with check (true);

create policy "Authenticated users can update incomes"
on public.incomes
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete incomes"
on public.incomes
for delete
to authenticated
using (true);
