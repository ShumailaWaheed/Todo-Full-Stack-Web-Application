---
id: "002"
title: "Show Chatbot on All Pages Except Home and Auth"
stage: "general"
date_iso: "2026-02-03"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "abdulwaheed"
command: "manual"
labels: ["chatbot", "ui", "layout", "conditional-rendering"]
links_spec: null
links_ticket: null
links_adr: null
links_pr: null
files_yaml:
  - "frontend/components/layout/client-layout.tsx"
tests_yaml:
  - "none"
---

# Show Chatbot on All Pages Except Home and Auth

## Prompt Text
chatbot home page or sign in page k elawa sare pages pe show ho

## Response Text
Updated the client layout to conditionally render the ChatBot component only on pages that are not the home page and not auth pages. The ChatBot will now appear on all authenticated pages except the home page and sign-in/sign-up pages.

## Outcome Impact
The floating chatbot now appears consistently across all authenticated pages (dashboard, tasks, analytics, etc.) while being hidden on the home page and authentication pages as requested.

## Tests Summary
none

## Files Summary
- frontend/components/layout/client-layout.tsx: Added conditional rendering to show ChatBot only when not on home page and not on auth pages

## Next Prompts
- Add chatbot availability indicator
- Enhance chatbot with contextual help based on current page
- Add chatbot persistence settings

## Reflection Note
The change ensures the chatbot appears on all authenticated pages while respecting the requirement to hide it from home and auth pages.

## Acceptance Criteria
- [x] ChatBot shows on dashboard pages
- [x] ChatBot shows on other authenticated pages
- [x] ChatBot hidden on home page
- [x] ChatBot hidden on auth pages (/auth/*)
- [x] Conditional rendering implemented correctly

## Failure Modes Observed
None

## Next Experiment to Improve Prompt Quality
N/A