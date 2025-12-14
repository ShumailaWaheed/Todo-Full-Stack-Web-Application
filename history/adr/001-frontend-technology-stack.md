# ADR-001: Frontend Technology Stack

**Status:** Accepted
**Date:** 2025-12-14

## Context

The todo application requires a modern, responsive frontend that provides an excellent user experience while supporting both desktop and mobile devices. The frontend needs to integrate with the authentication system and communicate with the backend API. The Phase II constitution specifies specific technology requirements that must be followed.

## Decision

We will use the following frontend technology stack:

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS only (no inline styles or CSS modules)
- **Architecture**: Server Components by default; Client Components only for interactivity
- **Authentication**: Better Auth with JWT plugin enabled

## Alternatives Considered

- **React + Vite + Custom Routing**: More complex setup, no built-in routing, would require additional libraries for server-side rendering
- **Remix**: Similar capabilities but smaller ecosystem, different learning curve
- **Vue.js/Nuxt.js**: Would require learning new framework, not specified in constitution
- **SvelteKit**: Different ecosystem, not specified in constitution

## Consequences

**Positive:**
- Server-side rendering provides excellent initial load performance
- TypeScript strict mode ensures type safety and reduces runtime errors
- Tailwind CSS provides utility-first approach that's efficient for responsive design
- Next.js App Router enables better code organization and file-based routing
- Server Components reduce bundle size and improve performance
- Better Auth provides secure authentication with JWT support as required

**Negative:**
- Learning curve for team members unfamiliar with Next.js App Router
- Potential complexity with Server/Client Component boundaries
- Bundle size considerations with full Next.js framework

## References

- `/specs/001-todo-fullstack-app/plan.md`
- `/specs/001-todo-fullstack-app/research.md`
- `.specify/memory/constitution.md` (Section III - Technology Governance)