-- PART 3/4: Row Level Security

alter table profiles enable row level security;
alter table seeker_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table match_explanations enable row level security;
alter table notifications enable row level security;

create policy "profiles read all" on profiles for select using (true);
create policy "profiles insert own" on profiles for insert with check (id = auth.uid());
create policy "profiles update own" on profiles for update using (id = auth.uid());

create policy "seeker_profiles read all" on seeker_profiles for select using (true);
create policy "seeker_profiles insert own" on seeker_profiles for insert with check (profile_id = auth.uid());
create policy "seeker_profiles update own" on seeker_profiles for update using (profile_id = auth.uid());

create policy "employer_profiles read all" on employer_profiles for select using (true);
create policy "employer_profiles insert own" on employer_profiles for insert with check (profile_id = auth.uid());
create policy "employer_profiles update own" on employer_profiles for update using (profile_id = auth.uid());

create policy "jobs select active or owner" on jobs for select using (is_active or employer_id = auth.uid());
create policy "jobs insert by employer" on jobs for insert with check (employer_id = auth.uid() and exists (select 1 from profiles where id = auth.uid() and role = 'employer'));
create policy "jobs update own" on jobs for update using (employer_id = auth.uid());
create policy "jobs delete own" on jobs for delete using (employer_id = auth.uid());

create policy "applications select if involved" on applications for select using (seeker_id = auth.uid() or exists (select 1 from jobs j where j.id = applications.job_id and j.employer_id = auth.uid()));
create policy "applications insert by seeker" on applications for insert with check (seeker_id = auth.uid() and exists (select 1 from profiles where id = auth.uid() and role = 'seeker'));
create policy "applications update by employer" on applications for update using (exists (select 1 from jobs j where j.id = applications.job_id and j.employer_id = auth.uid()));

create policy "match_explanations select if involved" on match_explanations for select using (seeker_id = auth.uid() or exists (select 1 from jobs j where j.id = match_explanations.job_id and j.employer_id = auth.uid()));
create policy "match_explanations insert any" on match_explanations for insert with check (auth.uid() is not null);

create policy "notifications select own" on notifications for select using (recipient_id = auth.uid());
