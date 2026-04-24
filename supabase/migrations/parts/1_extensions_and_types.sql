-- PART 1/4: Extensions and enum types

create extension if not exists vector;
create extension if not exists pgcrypto;

create type user_role as enum ('employer', 'seeker');
create type employment_type as enum ('full', 'part', 'gig');
create type experience_level as enum ('none', 'junior', 'middle', 'senior');
create type application_status as enum ('new', 'viewed', 'contacted', 'rejected');
