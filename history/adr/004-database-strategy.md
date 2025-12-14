# ADR-004: Database Strategy

**Status:** Accepted
**Date:** 2025-12-14

## Context

The todo application requires a persistent data store that supports user isolation, efficient querying, and scales to the expected load (up to 10,000 users with 1,000 tasks each). The Phase II constitution specifically requires Neon Serverless PostgreSQL and mandates user isolation at the database level.

## Decision

We will use the following database strategy:

- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel for type-safe database operations
- **User Isolation**: All queries must filter by user_id to enforce isolation
- **Indexing**: Required indexes on user_id, completed, and created_at fields
- **Data Model**: Tasks table with user_id foreign key referencing Better Auth users
- **Constraints**: Foreign key constraints and validation rules enforced at database level

## Alternatives Considered

- **Supabase**: Different PostgreSQL provider, would change connection management
- **SQLite**: Less suitable for concurrent users and scaling requirements
- **MongoDB**: Different paradigm than required, doesn't align with SQLModel approach
- **MySQL**: Different database system than specified in constitution
- **In-memory storage**: Not persistent, doesn't meet Phase II requirements

## Consequences

**Positive:**
- Neon Serverless provides automatic scaling and connection pooling
- PostgreSQL provides strong ACID guarantees and advanced querying capabilities
- User isolation enforced at database level provides security
- SQLModel provides type safety and prevents SQL injection
- Indexes on user_id ensure efficient isolation queries
- Foreign key constraints maintain data integrity

**Negative:**
- PostgreSQL complexity vs simpler solutions
- Potential cost considerations with Neon Serverless at scale
- Need to manage connection pooling and database migrations
- Serverless PostgreSQL may have cold start implications

## References

- `/specs/001-todo-fullstack-app/plan.md`
- `/specs/001-todo-fullstack-app/research.md`
- `/specs/001-todo-fullstack-app/data-model.md`
- `.specify/memory/constitution.md` (Section III - Technology Governance, Section IV - Security Requirements)