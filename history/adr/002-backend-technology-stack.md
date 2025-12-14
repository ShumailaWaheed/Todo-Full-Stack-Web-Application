# ADR-002: Backend Technology Stack

**Status:** Accepted
**Date:** 2025-12-14

## Context

The todo application requires a robust, scalable backend that can handle API requests, authenticate users via JWT, enforce user isolation, and interact with the PostgreSQL database. The backend must provide type-safe API responses and integrate well with the frontend. The Phase II constitution specifies specific technology requirements.

## Decision

We will use the following backend technology stack:

- **Language**: Python 3.13+
- **Framework**: FastAPI
- **ORM**: SQLModel (combining SQLAlchemy and Pydantic)
- **Validation**: Pydantic v2 for request/response validation
- **Package Manager**: UV (as specified in constitution)

## Alternatives Considered

- **Flask**: Less modern, no automatic documentation, less async support, no built-in validation
- **Django**: Too heavy for this use case, more complex for simple API requirements
- **Express.js**: Would require changing to Node.js ecosystem, not specified in constitution
- **Django REST Framework**: Still heavier than needed, different paradigm
- **SQLAlchemy Core**: More complex, less type-safe integration with Pydantic
- **Tortoise ORM**: Different syntax, less integration with FastAPI ecosystem

## Consequences

**Positive:**
- FastAPI provides excellent async support and automatic API documentation
- SQLModel combines SQLAlchemy and Pydantic for excellent type safety
- Pydantic v2 provides strong request/response validation
- Excellent performance with async support
- Strong type safety throughout the stack
- Automatic OpenAPI documentation generation
- Strong integration between FastAPI and Pydantic

**Negative:**
- Learning curve for team members unfamiliar with FastAPI
- Potential complexity with SQLModel if team is more familiar with raw SQLAlchemy
- Python async programming model requires understanding

## References

- `/specs/001-todo-fullstack-app/plan.md`
- `/specs/001-todo-fullstack-app/research.md`
- `.specify/memory/constitution.md` (Section III - Technology Governance)