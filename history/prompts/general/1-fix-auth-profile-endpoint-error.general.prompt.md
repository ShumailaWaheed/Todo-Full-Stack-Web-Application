---
id: 1
title: Fix Auth Profile Endpoint Error
stage: general
date_iso: 2026-01-16
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: main
user: user
command: "Fix 400 Bad Request error in auth profile endpoint"
labels:
  - "bug-fix"
  - "authentication"
  - "api-endpoint"
  - "backend"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/main.py"
  - "backend/src/schemas/user.py"
  - "backend/src/models/user.py"
tests_yaml: []
---

# Fix Auth Profile Endpoint Error

## PROMPT_TEXT
Resolve the 400 Bad Request error occurring in the frontend when calling checkAuthStatus function that attempts to fetch user profile data.

## RESPONSE_TEXT
Fixed the 400 Bad Request error by including the users router in the main backend application. The issue was that the frontend was calling `/api/{userId}/profile` endpoint but the backend's users router wasn't included in main.py. Made the following changes:
1. Updated backend/src/main.py to import and include the users router
2. Added missing UserResponse schema in backend/src/schemas/user.py
3. Updated User model in backend/src/models/user.py to include all required fields

## OUTCOME
The authentication flow now works correctly. The checkAuthStatus function can successfully fetch user profile data without encountering 400 Bad Request errors.

## EVALUATION
Success - The core issue was identified and resolved. The frontend can now communicate with the backend's profile endpoint properly.