-- Create app_role enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies for user_roles table
create policy "Users can view their own roles"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Only admins can insert roles"
  on public.user_roles
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update roles"
  on public.user_roles
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete roles"
  on public.user_roles
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Grant admin role to admin@eternalsecurity.com.au (user_id: 24762c22-3596-4861-b840-46962e415633)
insert into public.user_roles (user_id, role)
values ('24762c22-3596-4861-b840-46962e415633', 'admin');

-- Also grant admin role to info@eternalsecurity.com.au if they exist
-- First, we need to find their user_id from the profiles table
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from public.profiles
where email = 'info@eternalsecurity.com.au'
on conflict (user_id, role) do nothing;