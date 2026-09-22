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
- [How to Configure MySQL](#how-to-configure-mysql)
- [Environment Variables](#environment-variables)
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
**Database:** MySQL 8
**Tooling:** Maven, npm, Git

---

## Architecture

```
React (Vite)
     │  Axios (JWT in Authorization header)
     ▼
Spring Boot REST API
     │  Controller → Service → Repository
     ▼
MySQL (job_tracker)
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
on startup — no manual schema scripts are required for local development.

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
jobtracker/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/jobtracker/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── entity/
│       │   ├── dto/
│       │   ├── security/
│       │   ├── exception/
│       │   ├── config/
│       │   └── JobTrackerApplication.java
│       └── resources/
│           └── application.properties
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── context/
        ├── utils/
        ├── styles/
        ├── App.jsx
        └── main.jsx
```

---

## How to Run the Backend

**Prerequisites:** Java 17+, Maven 3.9+, a running MySQL 8 instance.

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

---

## How to Configure MySQL

```sql
CREATE DATABASE IF NOT EXISTS job_tracker
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'jobtrack'@'localhost' IDENTIFIED BY 'a_strong_password';
GRANT ALL PRIVILEGES ON job_tracker.* TO 'jobtrack'@'localhost';
FLUSH PRIVILEGES;
```

Then point the backend at it via `DB_USERNAME` / `DB_PASSWORD` (see below). The
application also auto-creates the database if it doesn't exist, thanks to
`createDatabaseIfNotExist=true` in the JDBC URL — the `CREATE DATABASE` step above
is optional for local development.

---

## Environment Variables

**Backend** (`backend/src/main/resources/application.properties` reads these):

| Variable            | Default                 | Description                        |
|---------------------|--------------------------|-------------------------------------|
| `DB_HOST`            | `localhost`              | MySQL host                          |
| `DB_PORT`            | `3306`                   | MySQL port                          |
| `DB_NAME`            | `job_tracker`            | Database name                       |
| `DB_USERNAME`        | `root`                   | MySQL username                      |
| `DB_PASSWORD`        | `root`                   | MySQL password                      |
| `JWT_SECRET`         | (dev default, change me) | Base64 HMAC secret for signing JWTs |
| `JWT_EXPIRATION_MS`  | `86400000` (24h)         | Token lifetime in milliseconds      |
| `CORS_ORIGINS`       | `http://localhost:5173`  | Comma-separated allowed origins     |
| `SEED_ENABLED`       | `true`                   | Seed a demo account with sample data |

**⚠️ Change `JWT_SECRET` before deploying anywhere beyond your own machine.**

**Frontend** (`frontend/.env`, copy from `.env.example`):

| Variable              | Default                          |
|-----------------------|-----------------------------------|
| `VITE_API_BASE_URL`   | `http://localhost:8080/api`      |

---

## Demo Account

On first startup (with `SEED_ENABLED=true`, the default), the backend creates a
demo account pre-loaded with sample applications so the UI is immediately
explorable:

```
Email:    demo@jobtrack.com
Password: demo1234
```

---

## Future Improvements

- Refresh tokens and silent token renewal
- Email verification and password-reset flow
- File upload for resumes attached to each application
- Kanban-style drag-and-drop board view for statuses
- Calendar sync for interview dates (Google Calendar / ICS export)
- Server-side pagination for large application lists
- Automated test suite (JUnit + Mockito on the backend, Vitest on the frontend)
- Dark mode
