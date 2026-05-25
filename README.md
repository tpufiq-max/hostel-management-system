# Hostel Management System

A modern, responsive web application for managing hostel operations, built with
React + Vite on the frontend and Spring Boot + JPA on the backend.

## Features

- **Dashboard** — overview of hostel statistics and notices
- **Student Management** — add, edit, and manage student records
- **Room Management** — track room allocations and availability
- **Fees Management** — handle student fee payments and records
- **Complaint System** — manage student complaints and resolutions
- **Attendance Tracking** — monitor student attendance
- **Visitor Management** — track hostel visitors
- **Notice Board** — post and manage hostel notices
- **Reports** — generate various reports and analytics

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, React Context
- **Backend:** Spring Boot 3.2, Spring Security, JWT, JPA / Hibernate
- **Database:** MySQL (production), H2 (development)
- **Build:** Maven (backend), npm (frontend)

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.9+
- MySQL 8+ (only required for the `prod` profile)

### Run the backend

```bash
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`. Active profile is configured in
`backend/src/main/resources/application.properties`. By default it uses the
`prod` profile (MySQL); switch to `dev` to run against the embedded H2.

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## First-time login (bootstrap admin)

The system **does not ship with demo data**. On first startup the backend
creates a single administrator account so you can sign in and begin entering
real data.

**Default bootstrap credentials (development only):**

- Email: `admin@hostel.local`
- Password: `ChangeMe@123`

> Change the password immediately after first login.

### Configuring the bootstrap admin

Override the defaults via environment variables (recommended for production)
or in `application.properties`:

```bash
APP_BOOTSTRAP_ADMIN_EMAIL=warden@yourhostel.com
APP_BOOTSTRAP_ADMIN_PASSWORD=YourStrongPassword!
APP_BOOTSTRAP_ADMIN_NAME="Hostel Warden"
APP_BOOTSTRAP_ADMIN_USERNAME=warden
APP_BOOTSTRAP_ADMIN_PHONE=9876543210
```

### Disabling the bootstrap (production)

Once your real admin user is configured, disable bootstrap entirely so the
default credentials cannot be re-created:

```bash
APP_BOOTSTRAP_ADMIN_ENABLED=false
```

The bootstrap is also a no-op when a user with the configured email already
exists in the database, so leaving it enabled is generally safe but explicitly
disabling it is recommended.

## Migrating from a previous version that seeded demo data

If your database already contains the old seeded users
(`admin@hostel.com`, `student@hostel.com`), the demo students
(`John Doe`, `Jane Smith`, etc.), or the 15 sample rooms, run the cleanup
script once:

```bash
mysql -u root -p hostel_db < backend/src/main/resources/db/migration/V1__remove_demo_data.sql
```

Then restart the backend; the new bootstrap admin will be created if no admin
exists.

## Project Structure

```
.
├── backend/
│   └── src/main/java/com/hostel/
│       ├── config/         # Spring configuration (CORS, security, bootstrap)
│       ├── controller/     # REST endpoints
│       ├── dto/            # Request/response DTOs
│       ├── entity/         # JPA entities
│       ├── exception/      # Global exception handler
│       ├── repository/     # Spring Data JPA repositories
│       ├── security/       # JWT filter, token provider
│       └── service/        # Business logic
└── frontend/
    ├── api/                # axios instance, interceptors
    ├── components/         # shared UI components
    ├── context/            # AuthContext, ThemeContext
    ├── features/           # feature-specific components
    ├── pages/              # routed pages
    └── routes.jsx          # application routing
```

## Available Scripts

### Backend
- `mvn spring-boot:run` — start the backend
- `mvn package` — build a runnable jar

### Frontend
- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run preview` — preview the production build
## API Documentation (Swagger / OpenAPI)

While the backend is running:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

The UI lets you explore every endpoint, see request/response schemas, and try
the APIs directly from the browser. Click **Authorize** at the top, paste your
JWT access token (from `POST /api/auth/login`), and protected endpoints become
callable.

## Features Overview

### Authentication
- Secure login system with role-based access
- JWT token-based authentication
- Protected routes

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation

### Modern UI/UX
- Clean, modern interface
- Consistent design system
- Smooth animations and transitions
- Dark/light theme support (expandable)

## Contributing

1. Follow the existing code style
2. Use Tailwind CSS for styling
3. Ensure responsive design
4. Test on multiple screen sizes
5. Follow React best practices

## License

MIT
