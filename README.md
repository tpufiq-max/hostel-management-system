# Hostel Management System

A modern, responsive web application for managing hostel operations built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard**: Overview of hostel statistics and notices
- **Student Management**: Add, edit, and manage student records
- **Room Management**: Track room allocations and availability
- **Fees Management**: Handle student fee payments and records
- **Complaint System**: Manage student complaints and resolutions
- **Attendance Tracking**: Monitor student attendance
- **Visitor Management**: Track hostel visitors
- **Notice Board**: Post and manage hostel notices
- **Reports**: Generate various reports and analytics

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Icons**: Heroicons (via SVG)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Demo Credentials

- **Email**: admin@hostel.com
- **Password**: admin123

## Project Structure

```
frontend/
├── components/
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout components (Sidebar, Navbar)
├── context/             # React Context for state management
├── features/            # Feature-specific components and services
├── pages/               # Main application pages
├── styles/              # Global styles and CSS
├── hooks/               # Custom React hooks
├── api/                 # API configuration and utilities
├── config/              # Application configuration
└── routes.jsx           # Application routing
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

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

This project is licensed under the MIT License.