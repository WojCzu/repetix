-- Migration: Remove generation_id from generation_error_logs
-- Description: Removes the generation_id column and its foreign key constraint from generation_error_logs table.
--   This change makes error logs independent from generations, as errors can occur before generation records exist.
--   This simplifies the data model and better reflects the actual error logging patterns in the application.
-- 
-- Changes:
--   - Drops foreign key constraint
--   - Drops index on generation_id
--   - Removes generation_id column
--   - Updates table comment

-- drop the foreign key constraint if it exists
-- note: this is a destructive operation that will remove the relationship between error logs and generations
alter table generation_error_logs
drop constraint if exists generation_error_logs_generation_id_fkey;

-- drop the index if it exists
-- note: removing index may temporarily impact query performance if it was being used
drop index if exists generation_error_logs_generation_id_idx;

-- remove the generation_id column
-- note: this is a destructive operation that will permanently remove the generation_id data
alter table generation_error_logs
drop column if exists generation_id;

-- update table comment to reflect the architectural change
comment on table generation_error_logs is 'Logs errors that occur during AI flashcard generation. Errors are independent events and not directly linked to generation records, as they often occur before generation records exist.';

-- note: row level security policies remain unchanged as they are based on user_id 