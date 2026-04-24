-- Jumys: AI Job Board for Aktau
-- Schema, RLS policies, and RPC functions

create extension if not exists vector;

-- =============================================
-- ENUM types
-- =============================================
create type user_role as enum ('employer', 'seeker');
create type employment_type as enum ('full', 'part', 'gig');
create type experience_level as enum ('none', 'junior', 'middle', 'senior');
create type application_status as enum ('new', 'viewed', 'contacted', 'rejected');

-- =============================================
-- TABLES
-- =============================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null,
  full_name text,
  phone text,
  telegram_chat_id bigint unique,
  district text,
  created_at timestamptz default now()
);

create table seeker_profiles (
  profile_id uuid primary key references profiles on delete cascade,
  about text,
  skills text[] default '{}',
  experience_years int default 0,
  desired_employment employment_type,
  embedding vector(1536)
);

create table employer_profiles (
  profile_id uuid primary key references profiles on delete cascade,
  company_name text not null,
  company_type text
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references profiles on delete cascade,
  title text not null,
  description text not null,
  category text,
  district text,
  employment employment_type,
  experience_required experience_level default 'none',
  salary_from int,
  salary_to int,
  skills_required text[] default '{}',
  embedding vector(1536),
  is_active bool default true,
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  seeker_id uuid references profiles on delete cascade,
  message text,
  status application_status default 'new',
  match_score numeric(4,3),
  created_at timestamptz default now(),
  unique(job_id, seeker_id)
);

create table match_explanations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  seeker_id uuid references profiles on delete cascade,
  explanation text not null,
  created_at timestamptz default now(),
  unique(job_id, seeker_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references profiles on delete cascade,
  kind text check (kind in ('new_job_match', 'new_application')),
  payload jsonb not null,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index on jobs using hnsw (embedding vector_cosine_ops);
create index on seeker_profiles using hnsw (embedding vector_cosine_ops);
create index on jobs (is_active, created_at desc);
create index on jobs (employer_id);
create index on applications (job_id);
create index on applications (seeker_id);
create index on notifications (recipient_id) where sent_at is null;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table profiles enable row level security;
alter table seeker_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table match_explanations enable row level security;
alter table notifications enable row level security;

-- profiles: readable by anyone (needed for employer name on job cards), writable by owner
create policy "profiles readable by all" on profiles for select using (true);
create policy "profiles insert own" on profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on profiles for update using (auth.uid() = id);

-- seeker_profiles: readable by self OR employers who have jobs the seeker applied to,
-- but for matching we also need employer to read potential candidates so keep select open.
create policy "seeker_profiles readable by all" on seeker_profiles for select using (true);
create policy "seeker_profiles insert own" on seeker_profiles for insert
  with check (auth.uid() = profile_id);
create policy "seeker_profiles update own" on seeker_profiles for update
  using (auth.uid() = profile_id);

-- employer_profiles: readable by all (company name shown on cards)
create policy "employer_profiles readable by all" on employer_profiles for select using (true);
create policy "employer_profiles insert own" on employer_profiles for insert
  with check (auth.uid() = profile_id);
create policy "employer_profiles update own" on employer_profiles for update
  using (auth.uid() = profile_id);

-- jobs: active jobs public; owner can see inactive ones too; insert employer only;
-- update/delete own only
create policy "jobs select active or owner" on jobs for select
  using (is_active or employer_id = auth.uid());
create policy "jobs insert by employer" on jobs for insert
  with check (
    employer_id = auth.uid()
    and exists (
      select 1 from profiles where id = auth.uid() and role = 'employer'
    )
  );
create policy "jobs update own" on jobs for update
  using (employer_id = auth.uid());
create policy "jobs delete own" on jobs for delete
  using (employer_id = auth.uid());

-- applications: visible to seeker (own) or employer (owning the job)
create policy "applications select if involved" on applications for select
  using (
    seeker_id = auth.uid()
    or exists (
      select 1 from jobs j where j.id = applications.job_id and j.employer_id = auth.uid()
    )
  );
create policy "applications insert by seeker" on applications for insert
  with check (
    seeker_id = auth.uid()
    and exists (
      select 1 from profiles where id = auth.uid() and role = 'seeker'
    )
  );
create policy "applications update by employer" on applications for update
  using (
    exists (
      select 1 from jobs j where j.id = applications.job_id and j.employer_id = auth.uid()
    )
  );

-- match_explanations: visible to seeker involved or employer owning the job; any involved party can insert
create policy "match_explanations select if involved" on match_explanations for select
  using (
    seeker_id = auth.uid()
    or exists (
      select 1 from jobs j where j.id = match_explanations.job_id and j.employer_id = auth.uid()
    )
  );
create policy "match_explanations insert any authenticated" on match_explanations for insert
  with check (auth.uid() is not null);

-- notifications: visible to recipient only
create policy "notifications select own" on notifications for select
  using (recipient_id = auth.uid());

-- =============================================
-- RPC: match_jobs_for_seeker
-- Returns jobs sorted by vector similarity to seeker embedding.
-- Optional filters: district, category.
-- =============================================
create or replace function match_jobs_for_seeker(
  p_seeker_id uuid,
  p_count int default 20,
  p_filter_district text default null,
  p_filter_category text default null
)
returns table (
  id uuid,
  title text,
  description text,
  category text,
  district text,
  employment employment_type,
  experience_required experience_level,
  salary_from int,
  salary_to int,
  skills_required text[],
  employer_id uuid,
  company_name text,
  created_at timestamptz,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_embedding vector(1536);
begin
  select embedding into v_embedding from seeker_profiles where profile_id = p_seeker_id;

  if v_embedding is null then
    return query
    select
      j.id, j.title, j.description, j.category, j.district,
      j.employment, j.experience_required, j.salary_from, j.salary_to,
      j.skills_required, j.employer_id, ep.company_name, j.created_at,
      0.0::float as similarity
    from jobs j
    left join employer_profiles ep on ep.profile_id = j.employer_id
    where j.is_active
      and (p_filter_district is null or j.district = p_filter_district)
      and (p_filter_category is null or j.category = p_filter_category)
    order by j.created_at desc
    limit p_count;
    return;
  end if;

  return query
  select
    j.id, j.title, j.description, j.category, j.district,
    j.employment, j.experience_required, j.salary_from, j.salary_to,
    j.skills_required, j.employer_id, ep.company_name, j.created_at,
    (1 - (j.embedding <=> v_embedding))::float as similarity
  from jobs j
  left join employer_profiles ep on ep.profile_id = j.employer_id
  where j.is_active
    and j.embedding is not null
    and (p_filter_district is null or j.district = p_filter_district)
    and (p_filter_category is null or j.category = p_filter_category)
  order by j.embedding <=> v_embedding
  limit p_count;
end;
$$;

-- =============================================
-- RPC: match_seekers_for_job
-- Returns seekers sorted by vector similarity to job embedding.
-- =============================================
create or replace function match_seekers_for_job(
  p_job_id uuid,
  p_count int default 20
)
returns table (
  profile_id uuid,
  full_name text,
  phone text,
  district text,
  about text,
  skills text[],
  experience_years int,
  desired_employment employment_type,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_embedding vector(1536);
begin
  select jobs.embedding into v_embedding from jobs where jobs.id = p_job_id;

  if v_embedding is null then
    return query
    select
      p.id as profile_id, p.full_name, p.phone, p.district,
      sp.about, sp.skills, sp.experience_years, sp.desired_employment,
      0.0::float as similarity
    from seeker_profiles sp
    join profiles p on p.id = sp.profile_id
    where p.role = 'seeker'
    order by p.created_at desc
    limit p_count;
    return;
  end if;

  return query
  select
    p.id as profile_id, p.full_name, p.phone, p.district,
    sp.about, sp.skills, sp.experience_years, sp.desired_employment,
    (1 - (sp.embedding <=> v_embedding))::float as similarity
  from seeker_profiles sp
  join profiles p on p.id = sp.profile_id
  where p.role = 'seeker'
    and sp.embedding is not null
  order by sp.embedding <=> v_embedding
  limit p_count;
end;
$$;

grant execute on function match_jobs_for_seeker(uuid, int, text, text) to anon, authenticated;
grant execute on function match_seekers_for_job(uuid, int) to anon, authenticated;
