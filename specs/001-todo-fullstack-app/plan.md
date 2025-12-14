# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2025-12-14 | **Spec**: [link]
**Input**: Feature specification from `/specs/001-todo-fullstack-app/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of a full-stack todo web application with user authentication, task CRUD operations, and user isolation. The application follows a monorepo architecture with a Next.js 16+ frontend using App Router and a FastAPI backend with SQLModel ORM. Authentication is handled via Better Auth with JWT tokens (short-lived access tokens with refresh tokens). All data is stored in Neon Serverless PostgreSQL with proper user isolation enforced at both API and database levels.

## Technical Context

**Language/Version**: Python 3.13+ (Backend), TypeScript/JavaScript (Frontend)
**Primary Dependencies**: Next.js 16+ (App Router), FastAPI, SQLModel, Pydantic v2, Better Auth, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL with indexes on user_id and created_at fields
**Testing**: Pytest (Backend), Jest + React Testing Library (Frontend), Playwright (E2E)
**Target Platform**: Web application (responsive, desktop and mobile)
**Project Type**: Full-stack web application with separate frontend and backend services
**Performance Goals**: API response <200ms (p95), hot reload <3s, support 100 concurrent users
**Constraints**: JWT authentication required for all endpoints, user data isolation enforced, 99.9% uptime
**Scale/Scope**: Support up to 10,000 registered users with up to 1,000 tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Spec-Driven Development Compliance
- ✅ All implementation based on approved spec: `/specs/001-todo-fullstack-app/spec.md`
- ✅ No code written without spec approval
- ✅ Traceability maintained via specs, plans, tasks, ADRs, PHRs

### Technology Stack Compliance
- ✅ Next.js 16+ with App Router (Constitution Section III)
- ✅ Server Components by default; Client Components only for interactivity
- ✅ TypeScript strict mode enforced
- ✅ Tailwind CSS only (no inline styles or CSS modules)
- ✅ Better Auth with JWT plugin enabled
- ✅ Python 3.13+, FastAPI framework
- ✅ SQLModel ORM (raw SQL forbidden unless ADR approved)
- ✅ Pydantic v2 for validation
- ✅ Neon Serverless PostgreSQL

### Security Requirements Compliance
- ✅ User data isolation - ALL queries filter by user_id
- ✅ Authorization enforcement - URL user_id matches authenticated user from JWT
- ✅ JWT enforcement on all endpoints
- ✅ Missing/invalid token returns 401 Unauthorized
- ✅ Unauthorized access returns 404 Not Found

### API Requirements Compliance
- ✅ All routes under `/api/`
- ✅ JWT required on all endpoints
- ✅ Authorization header: `Authorization: Bearer <token>`
- ✅ Mandatory endpoints implemented per spec:
  - GET /api/{user_id}/tasks
  - POST /api/{user_id}/tasks
  - GET /api/{user_id}/tasks/{id}
  - PUT /api/{user_id}/tasks/{id}
  - DELETE /api/{user_id}/tasks/{id}
  - PATCH /api/{user_id}/tasks/{id}/complete

### Forbidden Actions Compliance
- ✅ No code written without specs
- ✅ Authentication not bypassed
- ✅ No cross-user data access
- ✅ Acceptance criteria followed
- ✅ Approved stack adhered to

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-fullstack-app/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
/
├── .specify/
│   ├── memory/
│   │   └── constitution.md
│   └── templates/
├── specs/
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── history/
│   ├── adr/
│   └── prompts/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (dashboard)/
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   └── tasks/
│   ├── lib/
│   │   ├── auth/
│   │   ├── api/
│   │   └── types/
│   ├── styles/
│   │   └── globals.css
│   ├── public/
│   ├── CLAUDE.md
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── auth.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── tasks.py
│   │   ├── middleware/
│   │   │   └── auth.py
│   │   ├── database/
│   │   │   └── session.py
│   │   └── main.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── conftest.py
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── CLAUDE.md
│   ├── requirements.txt
│   └── alembic.ini
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

**Structure Decision**: Full-stack monorepo with separate frontend and backend services as required by Phase II constitution. The frontend uses Next.js App Router with Server Components by default and Client Components only where needed for interactivity. The backend uses FastAPI with SQLModel ORM for database operations and proper separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
