# Database Schema Plan

## 1. Tables

### generations

| Column                  | Type        | Constraints                                          |
| ----------------------- | ----------- | ---------------------------------------------------- |
| id                      | UUID        | PRIMARY KEY DEFAULT gen_random_uuid()                |
| user_id                 | UUID        | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE |
| input_hash              | CHAR(64)    | NOT NULL                                             |
| input_length            | INT         | NOT NULL CHECK (input_length BETWEEN 1000 AND 10000) |
| generated_count         | INT         | NOT NULL DEFAULT 0                                   |
| accepted_unedited_count | INT         | NULLABLE                                             |
| accepted_edited_count   | INT         | NULLABLE                                             |
| generation_duration     | INT         | NOT NULL                                             |
| created_at              | TIMESTAMPTZ | NOT NULL DEFAULT now()                               |
| updated_at              | TIMESTAMPTZ | NOT NULL DEFAULT now()                               |

### flashcards

| Column        | Type         | Constraints                                                 |
| ------------- | ------------ | ----------------------------------------------------------- |
| id            | UUID         | PRIMARY KEY DEFAULT gen_random_uuid()                       |
| user_id       | UUID         | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE        |
| generation_id | UUID         | REFERENCES generations(id) ON DELETE CASCADE                |
| front_text    | VARCHAR(200) | NOT NULL                                                    |
| back_text     | VARCHAR(500) | NOT NULL                                                    |
| source        | TEXT         | NOT NULL CHECK (source IN ('ai-full','ai-edited','manual')) |
| created_at    | TIMESTAMPTZ  | NOT NULL DEFAULT now()                                      |
| updated_at    | TIMESTAMPTZ  | NOT NULL DEFAULT now()                                      |

### generation_error_logs

| Column             | Type         | Constraints                                           |
| ------------------ | ------------ | ----------------------------------------------------- |
| id                 | UUID         | PRIMARY KEY DEFAULT gen_random_uuid()                 |
| user_id            | UUID         | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE  |
| generation_id      | UUID         | NOT NULL REFERENCES generations(id) ON DELETE CASCADE |
| model              | VARCHAR(100) | NOT NULL                                              |
| source_text_hash   | CHAR(64)     | NOT NULL                                              |
| source_text_length | INT          | NOT NULL                                              |
| error_code         | TEXT         | NOT NULL                                              |
| error_message      | TEXT         | NOT NULL                                              |
| created_at         | TIMESTAMPTZ  | NOT NULL DEFAULT now()                                |

## 2. Relationships

- **User -> Generations**: One-to-Many (`generations.user_id` → `auth.users.id`)
- **User -> Flashcards**: One-to-Many (`flashcards.user_id` → `auth.users.id`)
- **User -> GenerationErrorLogs**: One-to-Many (`generation_error_logs.user_id` → `auth.users.id`)
- **Generations -> Flashcards**: One-to-Many (`flashcards.generation_id` → `generations.id`)
- **Generations -> GenerationErrorLogs**: One-to-Many (`generation_error_logs.generation_id` → `generations.id`)

## 3. Indexes

- `CREATE INDEX ON generations(user_id);`
- `CREATE INDEX ON flashcards(user_id);`
- `CREATE INDEX ON flashcards(generation_id);`
- `CREATE INDEX ON generation_error_logs(user_id);`
- `CREATE INDEX ON generation_error_logs(generation_id);`

## 4. RLS Policies

Enable Row-Level Security and define owner-only access:

```sql
-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT, UPDATE, DELETE for owner
CREATE POLICY "generations_owner" ON generations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "flashcards_owner" ON flashcards
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "error_logs_owner" ON generation_error_logs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## 5. Additional Notes

- Ensure the `pgcrypto` extension is enabled for `gen_random_uuid()` or use `uuid-ossp` and `uuid_generate_v4()`.
- Implement `BEFORE UPDATE` triggers to automatically set `updated_at = now()` on generations and flashcards tables.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON generations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

- Hard-delete strategy is applied.
- Inputs are hashed via HMAC-SHA256 with a global secret on the application side before insertion.
