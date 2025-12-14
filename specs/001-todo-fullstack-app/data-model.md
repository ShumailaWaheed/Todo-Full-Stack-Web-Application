# Data Model: Todo Full-Stack Web Application

## Entity: User

**Description**: Represents an authenticated user of the system with unique identifier, email, and authentication credentials managed by the auth system.

**Storage**: Managed by Better Auth (external service)
**Fields**:
- `id` (string/UUID): Unique identifier for the user
- `email` (string): User's email address
- `created_at` (timestamp): When the account was created
- `updated_at` (timestamp): When the account was last updated

## Entity: Task

**Description**: Represents a todo item with unique identifier, title (max 200 characters), description (max 2000 characters), completion status, and user ownership relationship.

**Storage**: Neon Serverless PostgreSQL table: `tasks`
**Fields**:
- `id` (integer/UUID): Primary key, unique identifier for the task
- `title` (string, max 200 chars): Task title with character limit validation
- `description` (string, max 2000 chars): Task description with character limit validation
- `completed` (boolean): Completion status (true/false)
- `user_id` (string/UUID): Foreign key referencing the user who owns this task
- `created_at` (timestamp): When the task was created
- `updated_at` (timestamp): When the task was last updated

**Relationships**:
- `user_id` → `users.id` (many-to-one relationship)

**Indexes**:
- `user_id`: Required for efficient user isolation queries
- `completed`: Required for efficient filtering by completion status
- `created_at`: Required for efficient chronological sorting

**Validation Rules**:
- `title`: Required, max 200 characters
- `description`: Optional, max 2000 characters
- `completed`: Boolean, defaults to false
- `user_id`: Required, must reference an existing user
- All tasks must be owned by a valid user (foreign key constraint)

## Database Schema

```sql
-- Table for tasks (user data is managed by Better Auth)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Required indexes for performance and user isolation
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on any update
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## State Transitions

### Task State Transitions
- **Incomplete → Complete**: When user toggles completion status to complete
- **Complete → Incomplete**: When user toggles completion status to incomplete

### Validation Constraints
- All database queries must filter by `user_id` to enforce user isolation
- A user can only modify tasks where `user_id` matches their authenticated user
- Attempting to access another user's tasks should return 404 (not found) for security