-- Recreate match_jobs_for_seeker with a simpler 2-arg signature so that
-- PostgREST can resolve it from rpc('match_jobs_for_seeker', { p_seeker_id, p_count }).
-- Old 4-arg variant is dropped to avoid overload ambiguity.

drop function if exists public.match_jobs_for_seeker(uuid, int, text, text);
drop function if exists public.match_jobs_for_seeker(uuid, int);
drop function if exists public.match_jobs_for_seeker(uuid);

create or replace function public.match_jobs_for_seeker(
    p_seeker_id uuid,
    p_count int default 20
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
    select sp.embedding
      into v_embedding
      from seeker_profiles sp
     where sp.profile_id = p_seeker_id;

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
     order by j.embedding <=> v_embedding
     limit p_count;
end;
$$;

grant execute on function public.match_jobs_for_seeker(uuid, int) to anon, authenticated;

-- Tell PostgREST to reload its function cache immediately.
notify pgrst, 'reload schema';
