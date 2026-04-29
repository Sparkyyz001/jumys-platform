create table if not exists public.telegram_job_feedback (
    id uuid primary key default gen_random_uuid(),
    seeker_id uuid not null references public.profiles(id) on delete cascade,
    job_id uuid not null references public.jobs(id) on delete cascade,
    action text not null check (action in ('saved', 'disliked')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (seeker_id, job_id)
);

create index if not exists telegram_job_feedback_seeker_idx on public.telegram_job_feedback(seeker_id);
create index if not exists telegram_job_feedback_action_idx on public.telegram_job_feedback(action);

create or replace function public.set_telegram_job_feedback_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_telegram_job_feedback_updated_at on public.telegram_job_feedback;
create trigger trg_telegram_job_feedback_updated_at
before update on public.telegram_job_feedback
for each row execute function public.set_telegram_job_feedback_updated_at();

alter table public.telegram_job_feedback enable row level security;

drop policy if exists "Seeker manages own telegram feedback" on public.telegram_job_feedback;
create policy "Seeker manages own telegram feedback"
on public.telegram_job_feedback
for all
using (auth.uid() = seeker_id)
with check (auth.uid() = seeker_id);

grant select, insert, update, delete on public.telegram_job_feedback to authenticated;
grant select, insert, update, delete on public.telegram_job_feedback to service_role;
