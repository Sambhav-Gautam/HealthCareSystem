# HealthCareSystem

HCL - HealthCareSystem

A microservices-based healthcare system with a frontend (Vite + Tailwind) and backend microservices organized under `microservices/` (including `api-gateway`, `auth-service`, and `medical-service`). The repository is primarily JavaScript.

Note: this README describes the repository structure and how the pieces fit together. See architecture.md for a detailed architecture and request flows.

Quick links
- Frontend: frontend/
- Microservices: microservices/
  - API Gateway: microservices/api-gateway
  - Auth Service: microservices/auth-service
  - Medical Service: microservices/medical-service

Prerequisites
- Node.js (recommended v16+)
- npm or yarn
- (Optional) Docker & docker-compose if you containerize services
- MongoDB / PostgreSQL or another datastore (if services require one)

Repository structure (high level)
- frontend/ — Vite-based frontend app (TailwindCSS). Contains env examples: `.env.example`, `env.example.txt`, and `package.json`.
- microservices/
  - api-gateway/ — gateway to route requests from frontend to internal services and to handle cross-cutting concerns (CORS, rate limiting, auth validation, routing).
  - auth-service/ — authentication & authorization logic (register, login, token issuance/refresh).
  - medical-service/ — domain service handling patient data, appointments, prescriptions, etc.
- LICENSE, .gitignore

What this project provides
- A single-page frontend application for users (patients, clinicians, admins) to interact with the system.
- An API gateway that exposes stable public endpoints and forwards requests to appropriate microservices.
- An auth service that handles authentication (likely JWT-based) and user/session management.
- A medical service that implements core healthcare domain features (patient records, appointment booking, etc.).

Setup & running (local development — general guidance)
1. Clone the repository:
   git clone https://github.com/Sambhav-Gautam/HealthCareSystem.git
   cd HealthCareSystem

2. Inspect each service's README and env examples:
   - frontend/.env.example and frontend/env.example.txt contain example environment variables for the UI.
   - Check microservices/<service>/ for their own startup instructions and environment variables.

3. Install dependencies and start services (example):
   - Frontend:
     cd frontend
     npm install
     npm run dev
   - For each microservice (api-gateway, auth-service, medical-service):
     cd microservices/<service>
     npm install
     npm run dev (or the service's documented start command)

   Note: If a service uses a database, start and configure the DB before starting the service; follow the service-specific env variables.

Environment variables
- The frontend includes env example files. Typical variables you’ll need to provide:
  - API base URL(s) (e.g. VITE_API_BASE_URL or VITE_API_URL)
  - Auth endpoints (if separate)
- Backend services typically require:
  - PORT
  - DATABASE_URL or DB connection settings
  - JWT_SECRET (for token signing)
  - Any service-specific keys

Health-check & testing
- Each microservice should expose a /health or /status endpoint — use that to verify service availability.
- Use the frontend to interact with the API gateway which proxies to backend services.
- Add or run unit/integration tests provided in individual service folders (if present).

Development notes & recommendations
- Follow the conventions in each service folder (check package.json and README files).
- Keep secrets out of the repo — use env files and a secret manager for production.
- When adding new microservices, register routes in the API gateway and document env vars.

Contribution
- Fork, create a branch, and open PRs with focused changes.
- Add or update READMEs for any new services and provide migration/setup steps.

License
- See LICENSE in repo root.
