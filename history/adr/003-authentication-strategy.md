# ADR-003: Authentication Strategy

**Status:** Accepted
**Date:** 2025-12-14

## Context

The todo application requires secure user authentication with JWT tokens to ensure user isolation and data security. Users must be able to register, sign in, and have their sessions managed securely. The Phase II constitution specifically mentions Better Auth with JWT requirements and specifies token expiration strategies.

## Decision

We will use the following authentication strategy:

- **Authentication Library**: Better Auth with JWT plugin enabled
- **Token Strategy**: Short-lived access tokens (15-30 minutes) with refresh tokens for automatic renewal
- **Token Storage**: Secure HTTP-only cookies for web browsers
- **Backend Validation**: JWT tokens validated on all API endpoints
- **Secret Management**: Shared BETTER_AUTH_SECRET environment variable between frontend and backend

## Alternatives Considered

- **NextAuth.js**: React-based solution, but different ecosystem than Better Auth
- **Auth0/Clerk**: External dependency, less control over authentication flow
- **Custom JWT implementation**: More complex, reinventing security-critical components
- **Session-based authentication**: Would require different architecture, not aligned with JWT requirement
- **Long-lived tokens without refresh**: Less secure approach, doesn't meet security requirements

## Consequences

**Positive:**
- Better Auth specifically mentioned in constitution and provides excellent Next.js integration
- Short-lived tokens with refresh mechanism provides security balance
- JWT tokens work well with stateless API architecture
- Secure cookie storage prevents XSS attacks
- Automatic refresh token handling improves user experience
- Complies with Phase II constitution requirements

**Negative:**
- Additional dependency to manage
- Complexity of refresh token implementation
- Need to manage shared secret across services
- Potential complexity with token rotation

## References

- `/specs/001-todo-fullstack-app/plan.md`
- `/specs/001-todo-fullstack-app/research.md`
- `/specs/001-todo-fullstack-app/spec.md`
- `.specify/memory/constitution.md` (Section III - Technology Governance, Section IV - Security Requirements)