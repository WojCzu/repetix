-- Migration: Disable RLS Policies
-- Description: Drops all previously defined RLS policies for flashcards, generations, and generation_error_logs tables

-- Drop policies for generations table
drop policy if exists "generations_select_own" on generations;
drop policy if exists "generations_insert_own" on generations;
drop policy if exists "generations_update_own" on generations;
drop policy if exists "generations_delete_own" on generations;

-- Drop policies for flashcards table
drop policy if exists "flashcards_select_own" on flashcards;
drop policy if exists "flashcards_insert_own" on flashcards;
drop policy if exists "flashcards_update_own" on flashcards;
drop policy if exists "flashcards_delete_own" on flashcards;

-- Drop policies for generation_error_logs table
drop policy if exists "error_logs_select_own" on generation_error_logs;
drop policy if exists "error_logs_insert_own" on generation_error_logs;
drop policy if exists "error_logs_delete_own" on generation_error_logs;

-- Disable RLS on tables
alter table generations disable row level security;
alter table flashcards disable row level security;
alter table generation_error_logs disable row level security; 