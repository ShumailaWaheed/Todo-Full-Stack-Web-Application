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

## Phase II – Todo Full-Stack Web Application Constitution

**Scope:** Phase II (Web, Multi-User, Authenticated, Persistent)

---

## SECTION I – CORE PRINCIPLES

1. **Spec-Driven Development Workflow**

   * Specifications are the single source of truth.
   * No code may be written without an approved specification.

2. **AI as Primary Developer**

   * Claude Code is the primary implementation agent.
   * Humans provide guidance, review, and final approval.

3. **Mandatory Traceability**

   * All changes must be traceable through:

     * Specs, Plans, Tasks, ADRs, and PHRs.
   * No orphaned code or undocumented decisions are allowed.

4. **Test-First Mandate**

   * Tests must be planned before implementation begins.
   * Security-critical paths require explicit test coverage.

5. **Evolutionary Consistency**

   * Phase II must extend Phase I functionality.
   * No Phase I behavior may be altered without explicit ADR approval.

---

## SECTION II – DOMAIN MODEL (PHASE II EXTENSIONS)

**Existing Fields (Phase I):**

* id
* title
* description
* completed

**Phase II Additions:**

* user_id (foreign key referencing users table)
* created_at (timestamp)
* updated_at (timestamp)

Backward compatibility with Phase I is mandatory.

---

## SECTION III – TECHNOLOGY GOVERNANCE

### Frontend

* Next.js 16+ (App Router)
* Server Components by default; Client Components only when interactivity is required
* TypeScript strict mode enabled
* Tailwind CSS only (no inline styles or CSS modules)
* Better Auth with JWT plugin enabled
* Type-safe API client for backend communication

### Backend

* Python 3.13+
* FastAPI framework
* SQLModel ORM (raw SQL is forbidden unless approved via ADR)
* Pydantic v2 for validation
* Neon Serverless PostgreSQL
* UV package manager

### Authentication (Critical)

* Better Auth runs exclusively on the frontend
* JWT tokens used for backend authentication
* Shared secret via `BETTER_AUTH_SECRET` environment variable
* Token expiration: 7 days
* Password hashing using bcrypt

---

## SECTION IV – SECURITY REQUIREMENTS

1. **User Data Isolation**

   * All database queries must filter by `user_id`.
   * No shared or global task access is permitted.

2. **Authorization Enforcement**

   * URL `user_id` must match the authenticated user extracted from the JWT.
   * Unauthorized access returns **404 Not Found**.

3. **JWT Enforcement**

   * All API endpoints require a valid JWT.
   * Missing or invalid tokens must return **401 Unauthorized**.

4. **SQL Injection Prevention**

   * Only SQLModel parameterized queries are allowed.
   * Raw SQL usage requires explicit ADR approval.

---

## SECTION V – API-FIRST PRINCIPLES

* API contracts must be defined before implementation.
* Backend implements API contracts first.
* Frontend consumes APIs via a type-safe client.
* OpenAPI and Swagger documentation must be auto-generated.
* Any breaking API change requires an ADR.

---

## SECTION VI – API REQUIREMENTS

* All routes must be under `/api/`.
* JWT authentication is required for all endpoints.
* Authorization header format: `Authorization: Bearer <token>`.

**Mandatory Endpoints:**

* GET    `/api/{user_id}/tasks`
* POST   `/api/{user_id}/tasks`
* GET    `/api/{user_id}/tasks/{id}`
* PUT    `/api/{user_id}/tasks/{id}`
* DELETE `/api/{user_id}/tasks/{id}`
* PATCH  `/api/{user_id}/tasks/{id}/complete`

---

## SECTION VII – REPOSITORY STRUCTURE (MONOREPO)

```text
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
```

---

## SECTION VIII – REQUIRED FEATURES

1. **User Authentication**

   * Signup and signin via Better Auth
   * JWT issuance and expiration handling
   * JWT attached to all API requests

2. **Task Management (CRUD)**

   * Create, view, update, and delete tasks
   * Toggle task completion status
   * Task ownership strictly enforced

3. **User Isolation**

   * Users may only access their own tasks
   * Ownership enforced at both API and database levels

4. **Persistent Storage**

   * All application data stored in Neon PostgreSQL

5. **Responsive UI**

   * Fully responsive across desktop and mobile
   * Tailwind CSS enforced throughout

---

## SECTION IX – TESTING REQUIREMENTS

**Mandatory Test Types:**

* API integration tests
* React component tests
* End-to-end user journey tests
* Authentication flow tests
* User isolation tests

**Minimum Coverage:** 80 percent overall.

---

## SECTION X – SPEC-KIT AND CLAUDE GOVERNANCE

* All specifications reside under `/specs`.
* Specs must be organized into `features`, `api`, `database`, and `ui`.
* Claude Code must read and respect:

  * Root `CLAUDE.md`
  * Relevant specification files
  * Layer-specific `CLAUDE.md` files

---

## SECTION XI – FORBIDDEN ACTIONS

* Writing code without approved specifications
* Bypassing authentication mechanisms
* Cross-user data access
* Ignoring acceptance criteria
* Deviating from the approved technology stack
* Introducing breaking changes without an ADR

---

## SECTION XII – SUCCESS CRITERIA

Phase II is considered complete only when:

* All Phase II requirements are implemented
* JWT authentication is enforced across all endpoints
* User isolation is verified through automated tests
* Specifications, code, and runtime behavior are fully aligned
* No required ticket or acceptance criterion is missing

---

### FINAL RULE

If it is in the specification, it must be implemented.
If it is not in the specification, it does not exist.

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