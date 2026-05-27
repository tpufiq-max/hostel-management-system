# Hostel Management System

Full-stack hostel administration app — Spring Boot backend + React frontend, with proper role-based access control.

## Stack

- **Backend** — Java 17, Spring Boot 3.2, Spring Security with JWT, Spring Data JPA, Lombok. H2 file-based in dev (data persists across restarts), MySQL in prod. Maven.
- **Frontend** — React 18, Vite, React Router, axios. Theme-aware via context tokens; no external UI framework.
- **Auth model** — only the admin is auto-bootstrapped. Students must be registered by an admin via the UI; that creates their login automatically with a temporary password = lower-cased roll number.

---

## ⚡ Quick start — one command for both servers

You'll need **Java 17**, **Maven**, **Node 18+**, and **npm** on your PATH.

```bash
git clone https://github.com/tpufiq-max/hostel-management-system.git
cd hostel-management-system

# first time only — install root orchestrator + frontend deps
npm run install:all

# every time after that — runs backend + frontend in one terminal
npm run dev
```

You'll see colour-tagged output from both processes:

```
[backend ] 🏠 HMS Backend Ready — http://localhost:8080
[backend ]    Admin login : admin@hostel.com / admin123
[frontend]   ➜  Local:   http://localhost:5173/
```

Press **Ctrl+C** once and both processes shut down cleanly.

### Alternative launchers

| Platform | Command |
|---|---|
| Git Bash / macOS / Linux | `./start.sh` |
| Windows (cmd) | double-click `start.bat` (opens two terminal windows) |
| Two-terminal classic | `npm run dev:backend` in one, `npm run dev:frontend` in another |

---

## Logging in

| Role | Credentials | How they're created |
|---|---|---|
| **Admin** | `admin@hostel.com` / `admin123` | Auto-bootstrapped on first run (idempotent — skipped if already exists) |
| **Student** | (admin creates one) | Admin → Students → Add Student. Default password = lower-cased roll number. The temp password is shown once in the success toast. |

There is no demo student auto-seeded — that's deliberate. Per the security policy, only students registered by the admin can sign in.

---

## Available scripts (root)

```bash
npm run dev             # both backend (mvn spring-boot:run) + frontend (vite) in one terminal
npm run dev:backend     # backend only
npm run dev:frontend    # frontend only
npm run build           # mvn package -DskipTests + vite build
npm run install:all     # install concurrently + frontend deps
npm run test:rbac       # backend/rbac_test.py end-to-end RBAC suite (needs python)
```

---

## Role-based access summary

The backend enforces RBAC at the path level in `SecurityConfig` AND with `@PreAuthorize` on the controllers. The frontend mirrors it with route guards and a role-aware sidebar.

| Endpoint group | Admin / Warden | Student |
|---|---|---|
| `/api/students/**`, `/api/rooms/**`, `/api/fees/**`, `/api/attendance/**`, `/api/visitors/**`, `/api/complaints/**`, `/api/maintenance/**`, `/api/dashboard/**`, `/api/reports/**` | ✅ full | ❌ 403 |
| `/api/analytics/**`, `/api/financial/**` | ✅ admin only | ❌ 403 |
| `/api/notices`, `/api/events`, `/api/mess` | ✅ read+write | ✅ read only |
| `/api/me/**` (own profile, room, fees, attendance, complaints, maintenance, notices, dashboard) | ✅ (returns own record if linked) | ✅ scoped to caller |

The `JwtAuthenticationFilter` re-checks `User.isActive` per request, so the moment an admin deletes/deactivates a student their existing JWT stops working — no need to wait for the token to expire.

End-to-end verification: `backend/rbac_test.py` runs 14 checks covering admin login, student creation, login, scoped reads, blocked admin endpoints, complaint submission, delete-revokes-login, and JWT invalidation. All 14 pass.

---

## Module status

### ✅ Wired end-to-end (real backend ↔ real frontend)

| Module | Frontend page(s) | Backend endpoints |
|---|---|---|
| Authentication | `/login` | `POST /api/auth/{login,refresh,change-password}`, `GET /api/auth/me` |
| Profile / Settings / Help (any role) | `/profile`, `/settings`, `/help` | `GET /api/auth/me`, `POST /api/auth/change-password` |
| **Student portal** | `/`, `/me/{profile,room,fees,attendance,complaints,maintenance,notices}` | `GET /api/me/dashboard` + 8 self-scoped endpoints |
| Visitor log | `/visitor` | `GET/POST/PUT/DELETE /api/visitors`, `PUT /{id}/checkout` |
| Maintenance (admin) | `/maintenance` | `GET/POST/PUT/DELETE /api/maintenance` |
| Notices | `/notice` (admin), `/me/notices` (student) | `GET/POST/PUT/DELETE /api/notices` |
| Events / calendar | `/events` | `GET/POST/PUT/DELETE /api/events`, `GET /api/events/range` |
| Mess menu | `/mess` | `GET/POST/PUT/DELETE /api/mess` |
| Complaints (student) | `/me/complaints` | `GET/POST /api/me/complaints` |
| Maintenance (student) | `/me/maintenance` | `GET/POST /api/me/maintenance` |

### 🟡 Backend exists, frontend still on mock data

These pages render hardcoded arrays. The endpoints work; they just need the same wire-up the modules above got.

- Students roster — `/api/students` ↔ `pages/Students.jsx`
- Rooms — `/api/rooms` ↔ `pages/Rooms.jsx`
- Fees (admin) — `/api/fees` ↔ `pages/Fees.jsx`
- Attendance (admin) — `/api/attendance` ↔ `pages/Attendance.jsx`
- Complaints (admin view) — `/api/complaints` ↔ `pages/Complaint.jsx`

### 🔴 Decorative for now

These pages render but have no live backend behind them yet. Sketches of where the feature would go.

- Admin Dashboard — uses static counters (the student dashboard is real)
- Analytics — placeholder charts
- Allocation, Reports, Student Profiles, Financial Dashboard

---

## Project structure

```
hostel-management-system/
├── package.json              ← root orchestrator (npm run dev)
├── start.sh / start.bat      ← cross-platform launchers
│
├── backend/
│   ├── rbac_test.py          ← end-to-end RBAC verification
│   ├── src/main/java/com/hostel/
│   │   ├── config/           # SecurityConfig (path-based RBAC), DataInitializer
│   │   ├── controller/       # REST controllers
│   │   │   ├── MeController.java         ← per-user /api/me/*
│   │   │   ├── StudentController.java    ← @PreAuthorize ADMIN/WARDEN
│   │   │   └── ...
│   │   ├── service/          # @Transactional business logic
│   │   ├── repository/       # Spring Data JPA
│   │   ├── entity/           # JPA entities + enums
│   │   ├── dto/              # DTOs + ApiResponse envelope
│   │   ├── security/         # JWT provider/filter, CustomUserDetails
│   │   └── exception/        # GlobalExceptionHandler + custom exceptions
│   ├── src/main/resources/
│   │   ├── application.properties              # default profile = dev
│   │   ├── application-dev.properties          # H2 file-based, ddl-auto=update
│   │   └── application-prod.properties         # MySQL
│   └── pom.xml
│
└── frontend/
    ├── api/api.js            # axios instance + tokenService + envelope unwrap
    ├── components/
    │   ├── common/           # Button, Modal, ProtectedRoute, ErrorBoundary, ...
    │   └── layout/           # Layout, Navbar, role-aware Sidebar
    ├── context/              # AuthContext, ThemeContext, NotificationContext
    ├── pages/
    │   ├── student/          ← StudentDashboard + 7 /me/* pages + _meShared
    │   ├── RoleDashboard.jsx ← branches / to admin or student dashboard
    │   ├── Profile.jsx, Settings.jsx, Help.jsx, Login.jsx, ...
    │   └── (admin pages)
    ├── routes.jsx            # all routes + role guards
    └── vite.config.js
```

---

## Backend specifics

### Profiles & data sources

The default active profile is `dev`. Switch with `SPRING_PROFILES_ACTIVE=prod`.

| Profile | Database | DDL | Bootstrap |
|---|---|---|---|
| `dev` | H2 file at `backend/data/hosteldb.mv.db` | `update` (preserves rows across restarts) | admin only |
| `prod` | MySQL on `localhost:3306` | `update` | admin only |

The H2 console is enabled in dev at `http://localhost:8080/h2-console` — JDBC URL `jdbc:h2:file:./data/hosteldb`, user `sa`, password blank.

### Bootstrap (DataInitializer)

On first run only the admin is seeded. Disable with `APP_BOOTSTRAP_ADMIN_ENABLED=false`. To get a quick demo student for solo dev, set `APP_BOOTSTRAP_STUDENT_ENABLED=true` (off by default — students should come from admin in production).

### Auth

JWT-based. `POST /api/auth/login` returns `{ accessToken, refreshToken, tokenType: "Bearer", user }`. The frontend stores these via `tokenService` in `api/api.js`; the axios request interceptor attaches `Authorization: Bearer <token>` automatically. On `401` the response interceptor silently calls `POST /api/auth/refresh` and retries; if that also fails it dispatches `hms:session-expired` for `AuthContext` to redirect to login.

The filter re-fetches `UserDetails` per request and rejects the token if the account is no longer enabled — so admin deactivations take effect immediately even on already-issued JWTs.

### API response envelope

Every endpoint returns `{ success: boolean, message?: string, data?: T }`. The frontend `api/api.js` interceptor unwraps to `T`. Errors are normalised to `{ message, status, code, errors }`.

### Adding a student programmatically (curl example)

```bash
ADMIN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@hostel.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

curl -s -X POST http://localhost:8080/api/students \
  -H "Authorization: Bearer $ADMIN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@hms.com","rollNumber":"R001","year":2}'
# → response includes data.tempPassword = "r001"
```

---

## Frontend specifics

### Theme

Theme tokens live in `context/ThemeContext.jsx` and are exposed both as `t.text` / `t.bg` (inline styles) and CSS variables. Toggle from the Dark/Light button in the navbar.

### Role-aware navigation

`Sidebar` reads `user.role` from `AuthContext` and filters menu items. Admins see operational sections (Students, Rooms, Allocation, Fees, Visitors, Reports, Analytics, …). Students see only their personal section (My Profile, My Room, My Fees, My Attendance, My Complaints, My Maintenance, Notices) plus a personalised dashboard.

### Errors and toasts

- Render-time errors → `ErrorBoundary` with a recoverable fallback.
- API mutations → success/failure surfaced through `useNotification()` (one shared toast queue mounted once).
- `ProtectedRoute` blocks unauthorised role access at the route boundary; the URL bar can't get a student into `/students` even by manual entry.

---

## Honest known limitations

- **5 admin frontend pages still on mock data** (Students, Rooms, Fees, Attendance, Complaints admin view). The endpoints for these all work; they just need the inline arrays swapped for service calls — same wire-up as the modules already done.
- **6 pages are decorative only** (Admin Dashboard, Analytics, Allocation, Reports, Student Profiles, Financial Dashboard).
- **No registration UI.** Students are created by admin only — that's intentional for the security model.
- **Prod profile assumes local MySQL** with `hostel_db` schema. No Docker Compose or migration tool yet.
- **Single-instance H2 lock.** If the JVM is killed without graceful shutdown (close terminal, kill -9), the H2 file lock can outlive the process. Fix: `rm -rf backend/data` and restart. Always Ctrl+C cleanly.

---

## License

MIT.
