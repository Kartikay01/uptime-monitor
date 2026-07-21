# AI Collaboration Log

## AI Tech Stack

- Claude Chat (Anthropic Claude 4 Sonnet): backend, frontend, Docker and documentation generation.
- ChatGPT (OpenAI GPT-5.5): assignment planning, prompt engineering, debugging, README and AI log refinement.

## Prompts That Shipped It

### Backend
```
Build only the backend.

Stack:
- FastAPI
- SQLAlchemy
- SQLite
- APScheduler
- httpx

Requirements:
- Add URL
- List URLs
- Background scheduler every minute
- Store status code
- Response time
- Timestamp

Generate every backend file with filenames.
```

### Frontend
```
Build a complete React + Vite + TypeScript frontend using Tailwind CSS.
Use the exact FastAPI response schema.
Features:
- Dashboard
- Add URL form
- Auto refresh every 5 seconds
- Axios API layer
- Responsive UI
Generate every required file.
```

### Docker
```
Generate backend Dockerfile, frontend Dockerfile and docker-compose.yml.
Everything should run using:
docker compose up
```

### Documentation
```
Generate README with setup, testing instructions and deployment sketch.
```

## Course Corrections

### Frontend API mismatch
The initial frontend assumed a simplified response model. The prompt was updated with the exact GET /urls response schema so the generated UI matched the backend fields (`latest_check.is_up`, `status_code`, `response_time_ms`).

### Invalid package.json
The generated package.json was incomplete, resulting in an npm EJSONPARSE error. The file was corrected before installing dependencies.


### Missing uvicorn
After creating the virtual environment, `uvicorn` was unavailable. Installing the project dependencies inside the virtual environment resolved the issue.

## Development Process

AI accelerated scaffolding and boilerplate generation. Every generated component was manually reviewed, integrated, tested locally, debugged, and refined before being committed.


## Prompt summary

- Prompted Claude to scaffold a full React + Vite + TypeScript + Tailwind frontend for an uptime monitoring dashboard, consuming a pre-built FastAPI/SQLite backend (GET/POST /urls). Specified table columns, UP/DOWN/Pending status logic, 5s polling, loading/error states, and response-time color coding.
- Asked Claude to generate backend and frontend Dockerfiles plus a docker-compose.yml so the full stack runs via `docker compose up`.
- Asked Claude to generate a README covering setup (docker compose up), testing instructions, and a deployment sketch.


- "Design the architecture only. Do not generate code." — used to plan the system (FastAPI + in-process APScheduler backend, SQLite, polling React frontend) before writing anything, so the stack choice was deliberate rather than default.
- "Build only the backend. Stack: FastAPI, SQLAlchemy, SQLite, APScheduler, httpx. Requirements: Add URL, List URLs, Background scheduler every minute, Store status code, Response time, Timestamp. Generate every backend file with filenames." — generated the full backend: `database.py`, `models.py`, `schemas.py`, `scheduler.py`, `main.py`, `requirements.txt`, `Dockerfile`.
- "How to test this?" — generated local (venv/uvicorn) and curl-based smoke test steps to verify UP/DOWN detection end-to-end.
- Pasted a draft README and asked "is the backend part all valid for above implementation?" — used Claude to cross-check documented run commands against the actual generated file layout.
