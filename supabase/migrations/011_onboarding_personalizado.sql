-- Onboarding personalizado (plan Business)
-- Guarda requerimientos y preferencias del cliente para configurar su cuenta

create table if not exists onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text,
  industry text,
  team_size text,
  use_cases text,
  data_sources text,
  integration_preferences text,
  webhook_url text,
  sandbox boolean default false,
  contact_name text,
  contact_email text,
  status text default 'pendiente',
  notes text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create unique index if not exists onboarding_requests_user_id_idx on onboarding_requests (user_id);

create or replace function update_updated_at_onboarding_requests()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_onboarding_requests_updated_at on onboarding_requests;
create trigger trg_update_onboarding_requests_updated_at
before update on onboarding_requests
for each row
execute procedure update_updated_at_onboarding_requests();

alter table onboarding_requests enable row level security;

create policy "Users can manage their onboarding request"
  on onboarding_requests
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their onboarding request"
  on onboarding_requests
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their onboarding request"
  on onboarding_requests
  for update
  using (auth.uid() = user_id);

