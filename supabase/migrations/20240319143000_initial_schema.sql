-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema for Repetix including:
--   - generations table for tracking AI flashcard generation attempts
--   - flashcards table for storing user's flashcards
--   - generation_error_logs table for tracking generation errors
--   - Appropriate indexes, relationships, and RLS policies
--   - Triggers for updated_at timestamps

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Create tables
create table generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    input_hash char(64) not null,
    input_length int not null check (input_length between 1000 and 10000),
    generated_count int not null default 0,
    accepted_unedited_count int,
    accepted_edited_count int,
    generation_duration int not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id uuid references generations(id) on delete cascade,
    front_text varchar(200) not null,
    back_text varchar(500) not null,
    source text not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id uuid not null references generations(id) on delete cascade,
    model varchar(100) not null,
    source_text_hash char(64) not null,
    source_text_length int not null,
    error_code text not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create indexes
create index generations_user_id_idx on generations(user_id);
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index generation_error_logs_user_id_idx on generation_error_logs(user_id);
create index generation_error_logs_generation_id_idx on generation_error_logs(generation_id);

-- Create updated_at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger set_updated_at_generations
    before update on generations
    for each row execute function set_updated_at();

create trigger set_updated_at_flashcards
    before update on flashcards
    for each row execute function set_updated_at();

-- Enable Row Level Security
alter table generations enable row level security;
alter table flashcards enable row level security;
alter table generation_error_logs enable row level security;

-- RLS Policies for generations table
comment on table generations is 'Stores information about AI flashcard generation attempts';

create policy "generations_select_own" on generations
    for select using (auth.uid() = user_id);

create policy "generations_insert_own" on generations
    for insert with check (auth.uid() = user_id);

create policy "generations_update_own" on generations
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "generations_delete_own" on generations
    for delete using (auth.uid() = user_id);

-- RLS Policies for flashcards table
comment on table flashcards is 'Stores user flashcards, either AI-generated or manually created';

create policy "flashcards_select_own" on flashcards
    for select using (auth.uid() = user_id);

create policy "flashcards_insert_own" on flashcards
    for insert with check (auth.uid() = user_id);

create policy "flashcards_update_own" on flashcards
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "flashcards_delete_own" on flashcards
    for delete using (auth.uid() = user_id);

-- RLS Policies for generation_error_logs table
comment on table generation_error_logs is 'Logs errors that occur during AI flashcard generation';

create policy "error_logs_select_own" on generation_error_logs
    for select using (auth.uid() = user_id);

create policy "error_logs_insert_own" on generation_error_logs
    for insert with check (auth.uid() = user_id);

create policy "error_logs_delete_own" on generation_error_logs
    for delete using (auth.uid() = user_id); 