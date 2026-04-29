create or replace function public.match_jobs(
    p_query_embedding vector(1536),
    p_count int default 8,
    p_filter_district text default null
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
language sql
security definer
set search_path = public
as $$
    select
        j.id,
        j.title,
        j.description,
        j.category,
        j.district,
        j.employment,
        j.experience_required,
        j.salary_from,
        j.salary_to,
        j.skills_required,
        j.employer_id,
        ep.company_name,
        j.created_at,
        (1 - (j.embedding <=> p_query_embedding))::float as similarity
    from public.jobs j
    left join public.employer_profiles ep on ep.profile_id = j.employer_id
    where j.is_active
      and j.embedding is not null
      and (p_filter_district is null or j.district = p_filter_district)
    order by j.embedding <=> p_query_embedding
    limit p_count;
$$;

grant execute on function public.match_jobs(vector, int, text) to anon, authenticated;
notify pgrst, 'reload schema';
