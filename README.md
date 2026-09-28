# JobTrack — Job Application Tracker

**Track your applications. Manage your career.**

A full-stack job application tracker built with React (Vite) on the frontend and
Spring Boot + MySQL on the backend, with JWT authentication. Designed to look and
behave like a real SaaS product suitable for a developer portfolio.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [How to Run the Backend](#how-to-run-the-backend)
- [How to Run the Frontend](#how-to-run-the-frontend)
- [Configuration Profiles](#configuration-profiles)
- [Environment Variables](#environment-variables)
- [Deploying](#deploying)
  - [Backend to Render + Supabase](#backend-to-render--supabase)
  - [Frontend to Vercel](#frontend-to-vercel)
  - [Netlify / Cloudflare Pages](#netlify--cloudflare-pages)
  - [Continuous Deployment](#continuous-deployment)
- [Demo Account](#demo-account)
- [Future Improvements](#future-improvements)

---

## Project Overview

JobTrack lets a user create an account, log in, and manage every job application
they've sent — company, role, location, status, interview dates, notes, and job
links — from a single dashboard. It tracks the standard job-search pipeline:

```
Applied → Assessment → Interview → Selected / Rejected
```

Each user's applications are private to their account, enforced both by the JWT
authentication layer and by ownership checks on every request.

---

## Features

- Register / login / logout with JWT-based authentication
- Add, edit, delete job applications
- Track status (Applied, Assessment, Interview, Selected, Rejected)
- Interview date & time tracking
- Notes and job link per application
- Search applications by company, title, or location
- Filter by status, job type, and location
- Sort by newest, oldest, company name, or interview date
- Dashboard with live statistics and a status overview
- Upcoming and past interviews view
- Analytics: by status, by job type, and applications over time
- Editable profile and password change
- Fully responsive (desktop, tablet, mobile)
- Clean empty states and friendly error messages throughout

---

## Technology Stack

**Frontend:** React 18, Vite, React Router, Axios, Lucide icons, plain CSS
**Backend:** Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT (jjwt)
**Database:** PostgreSQL in production (Supabase), MySQL 8 for local development
**Tooling:** Maven, npm, Git, Docker, GitHub Actions

---

## Architecture

```
React (Vite)
     │  Axios (JWT in Authorization header)
     ▼
Spring Boot REST API
     │  Controller → Service → Repository
     ▼
PostgreSQL / Supabase   (production)
MySQL                    (local development)
```

Backend package layout follows a standard layered architecture:

```
controller   → REST endpoints, request/response mapping
service      → business logic, ownership checks, DTO mapping
repository   → Spring Data JPA interfaces
entity       → JPA entities (User, JobApplication)
dto          → request/response payloads
security     → JWT filter, JWT util, UserDetails implementation
exception    → custom exceptions + a global @RestControllerAdvice handler
config       → Spring Security config, CORS, demo data seeder
```

---

## Database Schema

Database: `job_tracker`

**users**

| Column     | Type         |
|------------|--------------|
| id         | BIGINT (PK)  |
| name       | VARCHAR      |
| email      | VARCHAR (unique) |
| password   | VARCHAR (bcrypt hash) |
| created_at | DATETIME     |
| updated_at | DATETIME     |

**job_applications**

| Column           | Type         |
|------------------|--------------|
| id               | BIGINT (PK)  |
| user_id          | BIGINT (FK → users.id) |
| company_name     | VARCHAR      |
| job_title        | VARCHAR      |
| location         | VARCHAR      |
| job_type         | ENUM (FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT) |
| status           | ENUM (APPLIED, ASSESSMENT, INTERVIEW, SELECTED, REJECTED) |
| application_date | DATE         |
| interview_date   | DATETIME     |
| job_url          | VARCHAR      |
| notes            | TEXT         |
| created_at       | DATETIME     |
| updated_at       | DATETIME     |

`spring.jpa.hibernate.ddl-auto=update` creates/updates these tables automatically
on startup — no manual schema scripts are required. The mapping is portable: IDs use
`GenerationType.IDENTITY` and the `notes` column is declared as `TEXT` rather than
`@Lob`, because `@Lob` on a String maps to an out-of-band `oid` large object on
PostgreSQL instead of a real column.

---

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Job Applications
```
GET    /api/jobs                 ?search=&status=&jobType=&location=&sort=
GET    /api/jobs/{id}
POST   /api/jobs
PUT    /api/jobs/{id}
PATCH  /api/jobs/{id}/status
DELETE /api/jobs/{id}
```

### Dashboard / Interviews / Analytics
```
GET /api/dashboard/stats
GET /api/interviews
GET /api/analytics
```

### User
```
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/change-password
```

All endpoints except `/api/auth/**` require a valid JWT in the `Authorization: Bearer <token>` header.

Standard HTTP status codes are used throughout: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `500`.

---

## Project Structure

```
jopapplication/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/jobtracker/
│       │   │   ├── controller/
│       │   │   ├── service/
│       │   │   ├── repository/
│       │   │   ├── entity/
│       │   │   ├── dto/
│       │   │   ├── security/
│       │   │   ├── exception/
│       │   │   ├── config/       SecurityConfig, DataSourceConfig,
│       │   │   │                 DataSeeder, ProductionConfigValidator
│       │   │   └── JobTrackerApplication.java
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── application-local.properties
│       │       └── application-prod.properties
│       └── test/
│           └── java/com/jobtracker/config/DataSourceConfigTest.java
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json            Vercel build + SPA rewrite
│   ├── netlify.toml           Netlify build + SPA rewrite
│   ├── public/_redirects      SPA rewrite for Cloudflare Pages
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       ├── utils/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
└── .github/workflows/
    ├── ci.yml                 build + test on every push/PR
    └── deploy.yml             optional CI-driven deploys
```

---

## How to Run the Backend

**Prerequisites:** Java 17+, Maven 3.9+, and MySQL 8 *or* PostgreSQL running locally.

```bash
cd backend

# Option A — use environment variables (recommended)
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=job_tracker
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
export JWT_SECRET=$(openssl rand -base64 48)
export CORS_ORIGINS=http://localhost:5173

# Run
./mvnw spring-boot:run
```

The API starts on **http://localhost:8080**. On first run it seeds a demo account
(see [Demo Account](#demo-account)) — disable this with `SEED_ENABLED=false`.

If you don't have the Maven wrapper jar available, run `mvn spring-boot:run` instead
(with Maven installed locally), or generate the wrapper with `mvn -N wrapper:wrapper`.

### Using PostgreSQL locally

Set `DATABASE_URL` to a standard connection string. It does not need the `jdbc:`
prefix, and credentials may be embedded in it — `DataSourceConfig` normalises the
whole thing into a JDBC URL and moves any password out of the URL:

```bash
export DATABASE_URL="postgresql://postgres:password@localhost:5432/job_tracker"
./mvnw spring-boot:run
```

### Using MySQL locally

MySQL is the default local profile and works out of the box, because the JDBC URL
sets `createDatabaseIfNotExist=true`. To use a dedicated user instead of `root`:

```sql
CREATE DATABASE IF NOT EXISTS job_tracker
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'jobtrack'@'localhost' IDENTIFIED BY 'a_strong_password';
GRANT ALL PRIVILEGES ON job_tracker.* TO 'jobtrack'@'localhost';
FLUSH PRIVILEGES;
```

Then point the backend at it via `DB_USERNAME` / `DB_PASSWORD` (see below).

---

## How to Run the Frontend

**Prerequisites:** Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env      # adjust VITE_API_BASE_URL if needed
npm run dev
```

The app starts on **http://localhost:5173** and proxies `/api` calls to the
backend at `http://localhost:8080` during development (see `vite.config.js`).

To build for production:

```bash
npm run build   # outputs to frontend/dist
npm run preview # serve the production build locally
```

`VITE_API_BASE_URL` is inlined into the bundle at **build** time, so changing it
requires a rebuild rather than a restart. In production the app refuses to start
without it instead of silently calling `localhost:8080`.

---

## Configuration Profiles

The backend is split across three properties files so a deployment cannot quietly
fall back to a development default:

| File | When it applies | Contains |
|------|-----------------|----------|
| `application.properties` | always | shared settings (JPA, pool, actuator, logging) |
| `application-local.properties` | no profile set (the default locally) | MySQL URL, dev JWT key, `localhost:5173` CORS, seeding **on** |
| `application-prod.properties` | `SPRING_PROFILES_ACTIVE=prod` | no fallbacks — every secret is empty by default |

`ProductionConfigValidator` runs at startup under the `prod` profile and **refuses
to start** if `JWT_SECRET` is missing or still the bundled development value, or if
`CORS_ORIGINS` is missing or contains a bare `*`. A bad deploy fails at boot with
a readable message rather than serving traffic with a forgeable token.

---

## Environment Variables

### Backend

| Variable | Default (local) | Description |
|----------|-----------------|-------------|
| `DATABASE_URL` | – | Platform connection string, e.g. `postgresql://user:pw@host:5432/db`. Takes priority over `SPRING_DATASOURCE_URL`. |
| `SPRING_DATASOURCE_URL` | MySQL on localhost | Full JDBC URL. Only set this if you are **not** using `DATABASE_URL`. |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3306` / `job_tracker` | Local MySQL parts. |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `root` | Local MySQL credentials. |
| `DB_POOL_MAX` / `DB_POOL_MIN_IDLE` | `10` / `2` | HikariCP pool sizing. |
| `JWT_SECRET` | dev key | Base64 HMAC secret for signing JWTs. **Required in production.** |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | Token lifetime in milliseconds. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins. Wildcards like `https://*.vercel.app` are supported; a bare `*` is rejected. **Required in production.** |
| `SEED_ENABLED` | `true` locally, `false` in prod | Seed the demo account on first boot. |
| `JPA_DDL_AUTO` | `update` | Hibernate schema management. |
| `LOG_LEVEL_APP` / `LOG_LEVEL_SQL` | `INFO` / `OFF` | Logging levels. |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend base URL including `/api`. Required at build time in production. |

**⚠️ `JWT_SECRET` must be set in production** — `openssl rand -base64 48`. The
application will not start without it under the `prod` profile.

---

## Deploying

### Backend to Render + Supabase

1. **Supabase** — create a project, then copy the connection string from
   **Project Settings > Database > Connection string**. Use the **Session pooler**
   (port 5432) or **Direct connection** (port 5432, IPv6) URI.

2. **Render** — New > Web Service, connect the repo, and set:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `backend` |
   | Runtime | Docker |
   | Health Check Path | `/actuator/health` |

3. Add these environment variables in **Render > Environment**:

   ```
   SPRING_PROFILES_ACTIVE=prod
   DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   JWT_SECRET=<openssl rand -base64 48>
   CORS_ORIGINS=https://<your-frontend>.vercel.app
   SEED_ENABLED=false
   ```

   `DATABASE_URL` is enough on its own — the password can stay embedded in the URI,
   and `sslmode=require` is added automatically for non-local hosts.

   Supabase's default `postgres` role is not a superuser, so if schema creation
   fails, either run the DDL from the Supabase SQL editor or set
   `JPA_DDL_AUTO=none` once the tables exist.

### Frontend to Vercel

1. New Project, import the repo, set **Root Directory** to `frontend`. Vercel reads
   `vercel.json` for the build command, output directory, SPA rewrite and cache
   headers.
2. Add the environment variable for **all** environments:

   ```
   VITE_API_BASE_URL=https://<your-backend>.onrender.com/api
   ```

3. Deploy, then copy the resulting URL into the backend's `CORS_ORIGINS` and
   redeploy the backend. Both sides need the update.

The `rewrites` rule in `vercel.json` is what makes a hard refresh on
`/dashboard` or `/applications/42` work instead of returning a 404.

### Netlify / Cloudflare Pages

`frontend/netlify.toml` and `frontend/public/_redirects` cover both.

- **Netlify** — set base directory to `frontend`; the config is picked up
  automatically.
- **Cloudflare Pages** — build command `npm run build`, output directory `dist`,
  root directory `frontend`. `_redirects` is copied into the output by Vite.

### Continuous Deployment

The simplest setup needs no CI configuration at all:

- **Render** — Settings > Service > Auto-Deploy, on branch `main`.
- **Vercel** — Settings > Git, connected to `main`, Deployments > Automatic.

Both then rebuild on every push to `main`. `.github/workflows/ci.yml` runs
`mvn verify` and `npm run build` on every push and pull request as a gate.

`.github/workflows/deploy.yml` is an alternative for driving deploys from CI
instead. It pings a Render deploy hook and runs the Vercel CLI with `--prebuilt`,
and each job skips itself with a notice if its secrets are not set. Required
secrets: `RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
`VERCEL_PROJECT_ID`. Store `VITE_API_BASE_URL` as an encrypted variable on the
Vercel project so it never passes through CI logs.

---

## Demo Account

On first startup, the backend creates a demo account pre-loaded with sample
applications so the UI is immediately explorable:

```
Email:    demo@jobtrack.com
Password: demo1234
```

Seeding is **on** locally (`application-local.properties`) and **off** in
production, because a publicly known password on a public URL is a liability. Set
`SEED_ENABLED=true` on Render if you want the demo data; the seeder is idempotent
and will not overwrite an existing account.

---

## Future Improvements

- Flyway migrations so `ddl-auto=update` can be replaced with `validate` in production
- Refresh tokens and silent token renewal
- Email verification and password-reset flow
- File upload for resumes attached to each application
- Kanban-style drag-and-drop board view for statuses
- Calendar sync for interview dates (Google Calendar / ICS export)
- Server-side pagination for large application lists
- Integration tests against a Testcontainers PostgreSQL
- Dark mode
