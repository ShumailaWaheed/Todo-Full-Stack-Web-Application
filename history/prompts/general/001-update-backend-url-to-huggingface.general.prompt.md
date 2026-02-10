---
id: "001"
title: "Update backend URL to Hugging Face Space"
stage: "general"
date_iso: "2026-02-05"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "Abdul Waheed"
command: "use shumii todoapp huggingface backend url"
labels: ["configuration", "backend", "huggingface"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "frontend/.env.local"
  - "frontend/next.config.ts"
tests_yaml: []
---

# Update backend URL to Hugging Face Space

## PROMPT_TEXT
```
use shumii todoapp huggingface backend url
https://huggingface.co/spaces/shumaila02/todo-backend-v2, ye wala backend use karen
```

## RESPONSE_TEXT
Updated the frontend configuration to use the Hugging Face backend URL instead of the localhost backend. Modified both the .env.local file and next.config.ts to point to the Hugging Face Space at https://shumaila02-todo-backend-v2.hf.space.

## OUTCOME
Successfully updated the backend API URLs in the frontend configuration to connect to the Hugging Face Space backend instead of the local development backend.

## EVALUATION
The configuration changes have been made to connect the frontend to the Hugging Face deployed backend. The URLs were updated in both the environment file and the Next.js configuration file to ensure consistency across the application.