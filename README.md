# Hostel Management System

A professional full-stack hostel management application with a responsive React frontend and Spring Boot backend.

## Tech Stack

### Frontend
- **React 18** with Vite 5
- **Tailwind CSS 3.4** with custom design system
- **React Router DOM 6** for navigation
- **Axios** with interceptors for API communication
- **Lucide React** for icons
- **JWT** token-based authentication

### Backend
- **Java 17** with Spring Boot 3.2
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **MySQL** (production) / **H2** (development)
- **Maven** build system
- **Lombok** for boilerplate reduction

---

## Project Structure

```
hostel-management-system/
├── frontend/                  # React + Vite frontend
│   ├── api/                   # Axios instance & interceptors
│   ├── components/
│   │   ├── common/            # Reusable UI components
│   │   └── layout/            # Layout, Sidebar, Navbar
│   ├── context/               # Auth & Theme contexts
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # All page components
│   ├── services/              # API service modules
│   ├── styles/                # Global CSS & variables
│   ├── config/                # App constants
│   └── features/              # Feature-based modules
│
├── backend/                   # Spring Boot backend
│   └── src/main/java/com/hostel/
│       ├── config/            # Security, CORS, data init
│       ├── controller/        # REST API controllers
│       ├── dto/               # Data Transfer Objects
│       ├── entity/            # JPA entities
│       ├── exception/         # Exception handling
│       ├── repository/        # Spring Data repositories
│       ├── security/          # JWT & auth filters
│       └── service/           # Business logic
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Java 17+** (JDK)
- **Maven** 3.8+
- **MySQL** 8.0+ (for production; H2 is used for development)

---

### 1. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 2. Run Backend (Development Mode with H2)

```bash
cd backend
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

H2 Console available at: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:hosteldb`
- Username: `sa`
- Password: (empty)

### 3. Run Backend (Production Mode with MySQL)

#### MySQL Setup
```sql
CREATE DATABASE hostel_db;
CREATE USER 'hostel_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hostel_db.* TO 'hostel_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Run with MySQL profile
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod \
  -Dspring-boot.run.arguments="--DB_USERNAME=hostel_user --DB_PASSWORD=your_password"
```

---

## Demo Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@hostel.com    | admin123    |
| Student | student@hostel.com  | student123  |

---

## API Endpoints

### Authentication
| Method | Endpoint           | Description         |
|--------|-------------------|---------------------|
| POST   | /api/auth/login    | User login          |
| POST   | /api/auth/register | User registration   |
| POST   | /api/auth/refresh  | Refresh JWT token   |

### Students
| Method | Endpoint                | Description         |
|--------|------------------------|---------------------|
| GET    | /api/students          | List all (paginated)|
| GET    | /api/students/{id}     | Get by ID           |
| GET    | /api/students/search   | Search students     |
| POST   | /api/students          | Create student      |
| PUT    | /api/students/{id}     | Update student      |
| DELETE | /api/students/{id}     | Delete student      |

### Rooms
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/rooms            | List all (paginated)|
| GET    | /api/rooms/{id}       | Get by ID           |
| GET    | /api/rooms/available  | Available rooms     |
| POST   | /api/rooms            | Create room         |
| PUT    | /api/rooms/{id}       | Update room         |
| DELETE | /api/rooms/{id}       | Delete room         |

### Fees
| Method | Endpoint                   | Description         |
|--------|---------------------------|---------------------|
| GET    | /api/fees                  | List all            |
| GET    | /api/fees/{id}             | Get by ID           |
| GET    | /api/fees/student/{id}     | Student's fees      |
| POST   | /api/fees                  | Create fee record   |
| PUT    | /api/fees/{id}             | Update fee          |
| DELETE | /api/fees/{id}             | Delete fee          |

### Attendance
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | /api/attendance/date/{date}     | Get by date          |
| GET    | /api/attendance/student/{id}    | Student attendance   |
| POST   | /api/attendance                 | Mark attendance      |
| POST   | /api/attendance/bulk            | Bulk mark            |
| PUT    | /api/attendance/{id}            | Update record        |

### Complaints
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | /api/complaints                 | List all             |
| GET    | /api/complaints/{id}            | Get by ID            |
| GET    | /api/complaints/student/{id}    | Student complaints   |
| POST   | /api/complaints                 | Create complaint     |
| PUT    | /api/complaints/{id}            | Update status        |
| DELETE | /api/complaints/{id}            | Delete complaint     |

### Dashboard
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/dashboard/stats  | Dashboard statistics |

---

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend (`backend/src/main/resources/application.properties`)
```properties
app.jwt.secret=your-secret-key
app.jwt.expiration=86400000
app.cors.allowed-origins=http://localhost:5173
```

---

## Features

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Dark/Light Theme** - Toggle between themes
- **JWT Authentication** - Secure token-based auth with refresh
- **Role-Based Access** - Admin, Warden, Student roles
- **Student Management** - Full CRUD with search
- **Room Management** - Allocation, status tracking
- **Fee Management** - Payment tracking, status badges
- **Attendance** - Mark, bulk mark, reports
- **Complaints** - Submit, track, resolve
- **Dashboard** - Real-time statistics
- **Reports** - Exportable reports
- **Notifications** - Toast notifications
- **Mobile Navigation** - Hamburger menu with slide-in sidebar

---

## Testing the API

### Login (get JWT token)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hostel.com","password":"admin123"}'
```

### Use token for authenticated requests
```bash
curl http://localhost:8080/api/students \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Build for Production

### Frontend
```bash
cd frontend
npm run build    # Output in dist/
```

### Backend
```bash
cd backend
mvn clean package -DskipTests    # Output: target/hostel-management-system-1.0.0.jar
java -jar target/hostel-management-system-1.0.0.jar --spring.profiles.active=prod
```
