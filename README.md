# Hostel Management System

Full-stack hostel administration app — Spring Boot backend + React frontend.

## Stack

- **Backend** — Java 17, Spring Boot 3.2, Spring Security with JWT, Spring Data JPA, Lombok. H2 in dev, MySQL in prod. Maven.
- **Frontend** — React 18, Vite, React Router, Tailwind CSS, axios. Theme-aware via CSS variables; no UI framework dependency.

## Quick start

You'll need **Java 17** and **Node 18+** locally.

```bash
# 1. Clone
git clone https://github.com/tpufiq-max/hostel-management-system.git
cd hostel-management-system

# 2. Backend (terminal 1)
cd backend
./mvnw spring-boot:run                   # or: mvn spring-boot:run
# → http://localhost:8080
# → http://localhost:8080/h2-console (jdbc:h2:mem:hosteldb / root / root123)

# 3. Frontend (terminal 2, from repo root)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The dev profile auto-seeds an admin user, sample students/rooms, plus
realistic demo data for the new modules. Log in with:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hostel.com` | `admin123` |
| Student | `student@hostel.com` | `student123` |

## Module status

This is the honest map of what works end-to-end vs. what's still scaffolding.

### ✅ Wired end-to-end (real backend ↔ real frontend)

| Module | Frontend page | Backend endpoints |
|---|---|---|
| Authentication | `/login` | `POST /api/auth/login`, `POST /refresh`, `GET /me`, password reset |
| Visitor log | `/visitor` | `GET/POST/PUT/DELETE /api/visitors`, `PUT /{id}/checkout` |
| Maintenance | `/maintenance` | `GET/POST/PUT/DELETE /api/maintenance` (status / priority / category filters) |
| Notices | `/notice` | `GET/POST/PUT/DELETE /api/notices` (category / priority / active filters) |
| Events / calendar | `/events` | `GET/POST/PUT/DELETE /api/events`, `GET /api/events/range?from=&to=` |
| Mess menu | `/mess` | `GET/POST/PUT/DELETE /api/mess` (day / mealType filters) |

These pages have real loading/error/empty states, server-side pagination where it matters, and live toasts for success/failure.

### 🟡 Backend exists, frontend still on mock data

The endpoints are implemented and tested with curl/Postman. The pages render hardcoded arrays and need to be wired up the same way the modules above were.

- Students — `/api/students` ↔ `pages/Students.jsx`
- Rooms — `/api/rooms` ↔ `pages/Rooms.jsx`
- Fees — `/api/fees` ↔ `pages/Fees.jsx`
- Attendance — `/api/attendance` ↔ `pages/Attendance.jsx`
- Complaints — `/api/complaints` ↔ `pages/Complaint.jsx`

### 🔴 Decorative for now

These pages render but have no real backend behind them yet. They're sketches of where the feature would go.

- Dashboard — uses static counters
- Analytics — uses placeholder charts
- Allocation
- Reports
- Student Profiles
- Financial Dashboard

## Project structure

```
hostel-management-system/
├── backend/
│   ├── src/main/java/com/hostel/
│   │   ├── config/          # CORS, security, data initializer, demo seeder
│   │   ├── controller/      # REST controllers, /api/...
│   │   ├── service/         # Business logic, @Transactional
│   │   ├── repository/      # Spring Data JPA interfaces
│   │   ├── entity/          # JPA entities + inner enums
│   │   ├── dto/             # Request / response DTOs + ApiResponse envelope
│   │   ├── security/        # JWT provider, filters, CustomUserDetails
│   │   └── exception/       # ResourceNotFound, BadRequest, GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── application.properties              # default profile = dev
│   │   ├── application-dev.properties          # H2, seeder on
│   │   └── application-prod.properties         # MySQL, seeder off
│   ├── .mvn-settings.xml    # Workspace-local Maven settings (proxy + mirror)
│   └── pom.xml
│
├── frontend/
│   ├── api/api.js           # axios instance + tokenService + envelope unwrap
│   ├── components/
│   │   ├── common/          # Button, Modal, Card, LoadingSkeleton, ErrorBoundary, ...
│   │   └── layout/          # Layout, Navbar, Sidebar
│   ├── context/             # AuthContext, ThemeContext, NotificationContext
│   ├── features/<module>/   # One folder per module: <module>Service.js + components
│   ├── pages/               # Route-level components (Dashboard, Login, Visitor, ...)
│   ├── styles/              # variables.css (tokens) + global.css
│   ├── App.jsx              # ErrorBoundary > Theme > Notification > Auth
│   ├── routes.jsx           # All routes + role guards
│   └── vite.config.js
│
└── README.md (this file)
```

## Backend specifics

### Profiles & data sources

The default active profile is `dev`. Switch profiles via `SPRING_PROFILES_ACTIVE=prod` or `-Dspring-boot.run.profiles=prod`.

| Profile | Database | DDL | Seeder |
|---|---|---|---|
| `dev` | H2 in-memory (`MODE=MySQL`) | `create-drop` | enabled |
| `prod` | MySQL on `localhost:3306` | `update` | disabled |

The H2 console is enabled in dev only, at `/h2-console`. JDBC URL is `jdbc:h2:mem:hosteldb`, username `root`, password `root123`.

### Demo data

`DataInitializer` always creates an admin user, a student user, 15 sample rooms, and 5 sample students. `DataSeeder` (controlled by `app.seed.demo-data.enabled`) additionally inserts:

- 28 mess menus (full week × 4 meal types)
- 30 maintenance requests across all 5 statuses
- 40 visitors mixed across CHECKED_IN / CHECKED_OUT / REJECTED
- 20 notices spanning every category and priority
- 15 events including upcoming, ongoing, completed, and cancelled

### Auth

JWT-based. `POST /api/auth/login` returns `{ accessToken, refreshToken, tokenType: "Bearer", user }`. The frontend stores these via `tokenService` in `api/api.js`; an axios request interceptor attaches `Authorization: Bearer <token>` to every call. On `401` the response interceptor silently calls `POST /api/auth/refresh` and retries; if that also fails it dispatches a `hms:session-expired` event that the `AuthContext` and `NotificationContext` listen for.

### API response envelope

Every endpoint returns `{ success: boolean, message?: string, data?: T }`. The frontend `api/api.js` interceptor automatically unwraps to `T`, so service files just see the inner DTO/Page object. Errors are normalised to `{ message, status, code, errors }`.

## Frontend specifics

### Theme

Theme tokens live in `styles/variables.css` and are mirrored as JS objects in `context/ThemeContext.jsx`. Toggle is `Light mode` / `Dark mode` in the navbar. The `.dark` class on `<html>` swaps the variable values; both inline-styled pages (`var(--text)`, `t.text`) and class-based CSS rules see the change.

### Errors and toasts

- Render-time errors → `ErrorBoundary` shows a recoverable fallback (Try again / Reload) with a dev-only stack trace.
- API mutations → success/failure are surfaced via `useNotification()` which is one shared toast queue, mounted once.

## Available scripts

### Backend

```bash
cd backend
./mvnw spring-boot:run                           # dev profile, starts on 8080
./mvnw test                                      # no tests yet, but the harness runs
./mvnw package                                   # produces target/*.jar
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run   # switch to MySQL prod profile
```

### Frontend

```bash
cd frontend
npm run dev        # vite dev server with HMR
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Honest known limitations

- **No tests yet.** Neither the backend nor the frontend has automated tests. There's no CI workflow either.
- **5 frontend pages still on mock data** (Students, Rooms, Fees, Attendance, Complaints). The endpoints for these all work; just nobody's swapped the inline arrays for service calls.
- **6 pages are decorative only** (Dashboard, Analytics, Allocation, Reports, Student Profiles, Financial Dashboard). They render but have no live data behind them.
- **No registration UI.** `POST /api/auth/register` works; there's just no link to it from the login screen yet. Same story for the password-reset endpoints.
- **Prod profile assumes a local MySQL** with a `hostel_db` database. There's no Docker compose or migration tool yet — the prod data source is configured for `localhost:3306` only.

## License

MIT.
