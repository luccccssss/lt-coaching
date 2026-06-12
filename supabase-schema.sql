-- Run this in your Supabase SQL editor

create table clients (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name text not null,
  gender text default 'male',
  goal text default 'Fat loss',
  start_weight numeric,
  target_weight numeric,
  weeks integer default 12,
  calories integer default 1800,
  protein integer default 150,
  carbs integer default 150,
  fats integer default 60,
  notes text,
  status text default 'active',
  meal_plan_id bigint,
  current_week integer default 0
);

create table meal_plans (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name text not null,
  goal text default 'General'
);

create table meals (
  id bigint generated always as identity primary key,
  plan_id bigint references meal_plans(id) on delete cascade,
  name text not null,
  foods text,
  calories integer default 0,
  protein integer default 0,
  carbs integer default 0,
  fats integer default 0,
  position integer default 0
);

create table checkins (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  client_id bigint references clients(id) on delete cascade,
  week integer not null,
  date text,
  weight numeric,
  height numeric,
  waist numeric,
  neck numeric,
  hips numeric,
  bf numeric,
  notes text,
  photo_url text
);

-- Storage bucket for progress photos
insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', true);

-- RLS policies (simple: authenticated users can do everything)
alter table clients enable row level security;
alter table meal_plans enable row level security;
alter table meals enable row level security;
alter table checkins enable row level security;

create policy "Auth users can manage clients" on clients for all using (auth.role() = 'authenticated');
create policy "Auth users can manage meal_plans" on meal_plans for all using (auth.role() = 'authenticated');
create policy "Auth users can manage meals" on meals for all using (auth.role() = 'authenticated');
create policy "Auth users can manage checkins" on checkins for all using (auth.role() = 'authenticated');

create policy "Auth users can upload photos" on storage.objects for insert with check (bucket_id = 'progress-photos' and auth.role() = 'authenticated');
create policy "Photos are publicly viewable" on storage.objects for select using (bucket_id = 'progress-photos');
