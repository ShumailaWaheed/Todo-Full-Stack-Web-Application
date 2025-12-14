# ADR-005: API Design Pattern

**Status:** Accepted
**Date:** 2025-12-14

## Context

The todo application requires a well-defined API that supports all required CRUD operations for tasks while enforcing user isolation and authentication. The API must follow REST conventions and meet the specific endpoint requirements outlined in the Phase II constitution.

## Decision

We will use the following API design pattern:

- **Architecture**: REST API with all routes under `/api/`
- **Authentication**: JWT tokens required on all endpoints via `Authorization: Bearer <token>` header
- **User Isolation**: All endpoints include user_id in path and validate against authenticated user
- **Endpoint Pattern**: `/api/{user_id}/tasks` and related sub-resources
- **HTTP Methods**: Standard REST methods (GET, POST, PUT, DELETE, PATCH)
- **Error Handling**: Standard HTTP status codes with consistent error response format

**Required Endpoints:**
- GET /api/{user_id}/tasks - List user's tasks
- POST /api/{user_id}/tasks - Create new task for user
- GET /api/{user_id}/tasks/{id} - Get specific task
- PUT /api/{user_id}/tasks/{id} - Update specific task
- DELETE /api/{user_id}/tasks/{id} - Delete specific task
- PATCH /api/{user_id}/tasks/{id}/complete - Toggle completion status

## Alternatives Considered

- **GraphQL**: More flexible but adds complexity, not specified in requirements
- **User-ID in JWT only**: Would require backend to extract user_id from token rather than URL
- **Different URL patterns**: Such as `/api/tasks?user_id=...` which doesn't emphasize user context as clearly
- **Custom authentication headers**: Rather than standard Authorization header
- **RPC-style endpoints**: Rather than REST conventions

## Consequences

**Positive:**
- Clear user context in URL path makes authorization logic explicit
- Standard REST conventions make API intuitive for developers
- JWT authentication provides stateless, scalable security
- User isolation enforced at URL level provides clear security boundary
- Consistent error handling improves client experience
- Matches Phase II constitution requirements exactly

**Negative:**
- URL user_id validation adds complexity to each endpoint
- Need to ensure user_id in URL matches JWT authenticated user
- Potential for user enumeration if error messages are not handled properly
- Additional validation complexity compared to simpler patterns

## References

- `/specs/001-todo-fullstack-app/plan.md`
- `/specs/001-todo-fullstack-app/research.md`
- `/specs/001-todo-fullstack-app/contracts/api-contract.md`
- `.specify/memory/constitution.md` (Section VI - API Requirements)