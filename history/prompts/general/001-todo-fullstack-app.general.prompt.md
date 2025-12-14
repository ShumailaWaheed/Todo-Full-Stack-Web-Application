---
id: 001
title: "todo-fullstack-app"
stage: spec
date_iso: "2025-12-14"
surface: "agent"
model: "Claude Sonnet 4.5"
feature: "none"
branch: "001-todo-fullstack-app"
user: "Shumaila Waheed"
command: "/sp.specify"
labels: ["specification", "todo-app", "fullstack", "authentication"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files_yaml: |
  - "specs/001-todo-fullstack-app/spec.md"
  - "specs/001-todo-fullstack-app/checklists/requirements.md"
tests_yaml: |
  - "spec completeness validation"
  - "requirement clarity check"
  - "user scenario validation"
---

# Todo Full-Stack Web Application Specification

## PROMPT_TEXT

```
# Phase II – Todo Full-Stack Web Application Constitution

## Purpose
Define strict constitutional rules for Claude Code + Spec-Kit Plus to design, implement, and evolve a production-ready Todo Full-Stack Web Application that transforms a console app into a secure, multi-user, web-based system with persistent storage.

────────────────────────────────────────────
## CORE PRINCIPLES
────────────────────────────────────────────
1. **Spec-First Development**
   - No code may be written without an existing, approved specification.
   - All implementation must strictly follow Spec-Kit Plus specs located under `/specs`.
   - Specs are the single source of truth.

2. **Accuracy & Consistency**
   - Frontend, backend, database, and authentication logic must be fully aligned.
   - No assumption-based implementation is allowed.
   - All features must match acceptance criteria defined in specs.

3. **Security by Default**
   - All API endpoints must be secured using JWT authentication.
   - No unauthenticated access is allowed to task data.
   - User isolation is mandatory for every database query.

4. **Maintainability & Clarity**
   - Code must be clean, readable, modular, and well-structured.
   - Follow idiomatic patterns of each technology used.
   - Avoid hacks, shortcuts, and temporary solutions.

5. **Full-Stack Integrity**
   - Frontend, backend, database, and auth must work together as a single system.
   - Changes in one layer must be reflected across all relevant layers and specs.

────────────────────────────────────────────
## MANDATORY TECHNOLOGY STACK
────────────────────────────────────────────
**Frontend:**
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (JWT enabled)

**Backend:**
- Python FastAPI
- SQLModel ORM
- Pydantic schemas
- JWT verification middleware

**Database:**
- Neon Serverless PostgreSQL

**Spec-Driven Tooling:**
- Claude Code
- Spec-Kit Plus

**Repository Structure:**
- Monorepo architecture is mandatory
- Folder structure must follow Spec-Kit conventions exactly

────────────────────────────────────────────
## REQUIRED FEATURES (PHASE II)
────────────────────────────────────────────
1. **User Authentication**
   - User signup and signin using Better Auth
   - JWT token issuance on login
   - Token expiry handling
   - Shared JWT secret via BETTER_AUTH_SECRET environment variable

2. **Task Management (CRUD)**
   - Create a new task
   - List all tasks for authenticated user
   - View task details
   - Update a task
   - Delete a task
   - Toggle task completion

3. **User Isolation**
   - Each user can only access their own tasks
   - Task ownership enforced at API and database level

4. **Persistent Storage**
   - All data stored in Neon PostgreSQL
   - No in-memory or temporary storage allowed

5. **Responsive UI**
   - Fully responsive frontend
   - Usable on desktop and mobile devices

────────────────────────────────────────────
## API REQUIREMENTS
────────────────────────────────────────────
**Base Rules:**
- All routes must be under `/api/`
- All routes require JWT authentication
- Authorization header format: `Authorization: Bearer <token>`

**Endpoints (Mandatory):**
- GET    /api/{user_id}/tasks
- POST   /api/{user_id}/tasks
- GET    /api/{user_id}/tasks/{id}
- PUT    /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH  /api/{user_id}/tasks/{id}/complete

**Rules:**
- Backend must extract user ID from JWT
- URL user_id must match authenticated user
- Mismatch results in 403 Forbidden
- Missing or invalid token results in 401 Unauthorized

────────────────────────────────────────────
## AUTHENTICATION & JWT CONSTITUTION
────────────────────────────────────────────
- Better Auth runs ONLY on Next.js frontend
- FastAPI backend NEVER trusts frontend blindly
- JWT verification is mandatory for every request
- Backend must:
  - Verify JWT signature
  - Decode user data
  - Enforce user ownership
- Frontend must:
  - Attach JWT token to every API request
  - Handle expired tokens gracefully

────────────────────────────────────────────
## DATABASE CONSTITUTION
────────────────────────────────────────────
**Tables:**
- users (managed by Better Auth)
- tasks (managed by backend)

**Rules:**
- Every task MUST have a `user_id` foreign key
- All queries MUST be filtered by authenticated `user_id`
- Indexes required:
  - tasks.user_id
  - tasks.completed

**ORM Rules:**
- SQLModel is mandatory
- No raw SQL unless explicitly required and justified

────────────────────────────────────────────
## SPEC-KIT RULES (NON-NEGOTIABLE)
────────────────────────────────────────────
- Specs must live under `/specs`
- Spec categories:
  - `/specs/features`
  - `/specs/api`
  - `/specs/database`
  - `/specs/ui`
- All changes require spec updates first
- Claude Code must always reference specs using: `@specs/path/to/file.md`

────────────────────────────────────────────
## CLAUDE.md GOVERNANCE
────────────────────────────────────────────
- Root CLAUDE.md defines global rules
- frontend/CLAUDE.md defines frontend-only rules
- backend/CLAUDE.md defines backend-only rules
- Claude Code must read:
  - Root CLAUDE.md
  - Relevant feature spec
  - API spec
  - Database spec
  - Layer-specific CLAUDE.md

────────────────────────────────────────────
## QUALITY STANDARDS
────────────────────────────────────────────
**Code Quality:**
- No unused code
- No dead files
- No commented-out logic
- Proper error handling everywhere

**Security:**
- No secrets committed to repo
- Environment variables required for secrets
- JWT secret must match across services

**Testing & Validation:**
- All endpoints tested manually or via scripts
- Authentication flow verified end-to-end
- User isolation verified for all CRUD operations

────────────────────────────────────────────
## FORBIDDEN ACTIONS
────────────────────────────────────────────
- Writing code without specs
- Bypassing authentication
- Sharing data between users
- Ignoring acceptance criteria
- Mixing concerns across layers
- Deviating from defined stack

────────────────────────────────────────────
## SUCCESS CRITERIA
────────────────────────────────────────────
The project is considered COMPLETE only when:
- All Phase II requirements are implemented
- All API endpoints are secured with JWT
- Each user sees only their own tasks
- Frontend and backend work seamlessly
- Specs, code, and behavior are fully aligned
- No requirement from Phase II is missing

────────────────────────────────────────────
## FINAL RULE
────────────────────────────────────────────
- If a requirement is not written in specs, it does not exist.
- If it exists in specs, it MUST be implemented exactly.

**This constitution is binding for all development using Claude Code + Spec-Kit Plus for this project.**
```

## RESPONSE_TEXT

Created comprehensive feature specification for the Todo Full-Stack Web Application based on the provided constitution. The specification includes:

- User Scenarios & Testing with 3 prioritized user stories (Authentication P1, Task Management P2, Task Completion P3)
- Complete functional requirements (FR-001 through FR-012) covering authentication, task management, security, and UI requirements
- Key entities (User and Task) with their relationships
- Success criteria (SC-001 through SC-008) with measurable outcomes
- Edge cases covering security, error handling, and system behavior
- Quality validation checklist confirming all requirements met

The specification adheres to the constitutional requirements for JWT authentication, user isolation, persistent storage, and full-stack integration. All implementation details were avoided in favor of user-focused requirements and measurable outcomes.

## OUTCOME

Specification successfully created and validated. Ready for planning phase (/sp.plan).

## EVALUATION

The specification meets all constitutional requirements:
- ✅ Spec-first development approach followed
- ✅ Security by default with JWT authentication requirements
- ✅ User isolation requirements documented
- ✅ Full-stack integrity considerations included
- ✅ Technology-agnostic requirements with measurable success criteria
- ✅ All mandatory sections completed
- ✅ No implementation details leaked into specification