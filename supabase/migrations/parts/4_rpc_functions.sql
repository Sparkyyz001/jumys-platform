-- PART 4/4: RPC functions for AI matching

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
