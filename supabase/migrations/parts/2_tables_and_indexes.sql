-- PART 2/4: Tables and indexes

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

create index jobs_embedding_idx on jobs using hnsw (embedding vector_cosine_ops);
create index seeker_embedding_idx on seeker_profiles using hnsw (embedding vector_cosine_ops);
create index jobs_active_created_idx on jobs (is_active, created_at desc);
create index jobs_employer_idx on jobs (employer_id);
create index applications_job_idx on applications (job_id);
create index applications_seeker_idx on applications (seeker_id);
create index notifications_pending_idx on notifications (recipient_id) where sent_at is null;
