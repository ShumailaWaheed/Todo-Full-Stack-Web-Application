---
id: 1
title: Create Initial Constitution
stage: constitution
date: 2025-12-14
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: master
user: Shumaila Waheed
command: /sp.constitution
labels: [constitution, setup, governance]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```text
Phase II – Todo Full-Stack Web Application Constitution

**Scope:** Phase II (Web, Multi-User, Authenticated, Persistent)

---

SECTION I – CORE PRINCIPLES

1. **Spec-Driven Development Workflow**
   - Specs are the single source of truth.
   - No code may be written without an approved spec.

2. **AI as Primary Developer**
   - Claude Code is the primary implementation agent.
   - Humans provide guidance, review, and approval.

3. **Mandatory Traceability**
   - All changes must be traceable via:
     - Specs, Plans, Tasks, ADRs, PHRs
   - No orphan code or undocumented decisions allowed.

4. **Test-First Mandate**
   - Tests must be planned before implementation.
   - Security-critical paths require explicit tests.

5. **Evolutionary Consistency**
   - Phase II extends Phase I.
   - No Phase I behavior may be broken without explicit ADR approval.

---

## SECTION II – DOMAIN MODEL (PHASE II EXTENSIONS)

**Existing Fields (from Phase I):**
- id, title, description, completed

**Phase II Additions:**
- user_id (foreign key → users table)
- created_at (timestamp)
- updated_at (timestamp)

Backward compatibility with Phase I is mandatory.

---

SECTION III – TECHNOLOGY GOVERNANCE

**Frontend:**
- Next.js 16+ (App Router)
- Server Components by default; Client Components only for interactivity
- TypeScript strict mode
- Tailwind CSS ONLY (no inline styles or CSS modules)
- Better Auth with JWT plugin enabled
- Type-safe API client for backend communication

**Backend:**
- Python 3.13+, FastAPI framework
- SQLModel ORM (raw SQL forbidden unless approved via ADR)
- Pydantic v2 for validation
- Neon Serverless PostgreSQL
- UV package manager

**Authentication (Critical):**
- Better Auth runs on frontend only
- JWT tokens used for backend authentication
- Shared secret via BETTER_AUTH_SECRET environment variable
- Token expiration: 7 days
- Password hashing using bcrypt

---

SECTION IV – SECURITY REQUIREMENTS

1. **User Data Isolation**
   - ALL database queries must filter by user_id.
   - No shared/global task access.

2. **Authorization Enforcement**
   - URL user_id must match authenticated user from JWT.
   - Unauthorized access returns **404 Not Found**.

3. **JWT Enforcement**
   - All endpoints require valid JWT.
   - Missing/invalid token → 401 Unauthorized.

4. **SQL Injection Prevention**
   - SQLModel parameterized queries only.
   - Raw SQL requires ADR approval.

---

SECTION V – API-FIRST PRINCIPLES

- API contracts defined before implementation
- Backend implements API contracts first
- Frontend consumes APIs via type-safe client
- OpenAPI/Swagger documentation auto-generated
- Any breaking API change requires an ADR

---

SECTION VI – API REQUIREMENTS

**All routes under `/api/`**
**JWT required on all endpoints**
**Authorization header:** `Authorization: Bearer <token>`

**Mandatory Endpoints:**
- GET    /api/{user_id}/tasks
- POST   /api/{user_id}/tasks
- GET    /api/{user_id}/tasks/{id}
- PUT    /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH  /api/{user_id}/tasks/{id}/complete

---

SECTION VII – REPOSITORY STRUCTURE (MONOREPO)

/
├── .specify/memory/constitution.md
├── .spec-kit/config.yaml
├── specs/
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── history/
│   ├── adr/
│   └── prompts/
├── frontend/
│   ├── CLAUDE.md
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/
│   ├── CLAUDE.md
│   ├── src/
│   └── tests/
├── docker-compose.yml
├── CLAUDE.md
└── README.md

---

SECTION VIII – REQUIRED FEATURES

1. **User Authentication**
   - Signup/signin via Better Auth
   - JWT issuance & expiration
   - Token attached to all API requests

2. **Task Management (CRUD)**
   - Create, view, update, delete tasks
   - Toggle completion status
   - Task ownership enforced

3. **User Isolation**
   - Only own tasks accessible
   - API and DB enforce ownership

4. **Persistent Storage**
   - All data stored in Neon PostgreSQL

5. **Responsive UI**
   - Desktop & mobile compatible
   - Tailwind CSS enforced

---

SECTION IX – TESTING REQUIREMENTS

Mandatory test types:
- API integration tests
- React component tests
- End-to-End user journey tests
- Authentication flow tests
- User isolation tests

**Minimum coverage:** 80% overall

---

SECTION X – SPEC-KIT & CLAUDE GOVERNANCE

- Specs live under `/specs`
- Organized by `features`, `api`, `database`, `ui`
- Claude Code must read:
  - Root CLAUDE.md
  - Relevant spec files
  - Layer-specific CLAUDE.md

---

SECTION XI – FORBIDDEN ACTIONS

- Writing code without specs
- Bypassing authentication
- Cross-user data access
- Ignoring acceptance criteria
- Deviating from approved stack
- Introducing breaking changes without ADR

---

SECTION XII – SUCCESS CRITERIA

Phase II is COMPLETE only when:
- All Phase II requirements implemented
- JWT auth enforced everywhere
- User isolation verified via tests
- Specs, code, and behavior aligned
- No ticket requirement is missing

**FINAL RULE:**
If it is in the spec, it MUST be implemented.
If it is not in the spec, it does not exist.
```

## Response snapshot

Created the initial constitution file for the Phase II Todo Full-Stack Web Application project at `.specify/memory/constitution.md`. The constitution includes all the required sections from the user input:

1. Core Principles (Spec-Driven Development, AI as Primary Developer, Mandatory Traceability, Test-First Mandate, Evolutionary Consistency)
2. Domain Model extensions for Phase II
3. Technology Governance for both frontend and backend
4. Security Requirements
5. API-First Principles
6. API Requirements with specific endpoints
7. Repository Structure
8. Required Features
9. Testing Requirements
10. Spec-Kit & Claude Governance
11. Forbidden Actions
12. Success Criteria

The constitution was created with version 1.0.0, ratified on 2025-12-14, and follows the exact specifications provided in the user input.

## Outcome

- ✅ Impact: Created project constitution file that will guide all future development
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md with complete constitution
- 🔁 Next prompts: Implement features according to the constitution guidelines
- 🧠 Reflection: Constitution provides clear governance structure for the project

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): not applicable
- Prompt variant (if applicable): not applicable
- Next experiment (smallest change to try): not applicable