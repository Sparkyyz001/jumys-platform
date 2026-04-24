-- Fix ambiguous "id" reference inside RPC for seeker matching.
-- In PL/pgSQL, output columns can shadow unqualified names.
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
  select jobs.embedding into v_embedding
  from jobs
  where jobs.id = p_job_id;

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
