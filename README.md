# MedLife Hospital Management System

A production-ready, full-stack Hospital Management System (HMS) built with modern technologies.

## Features

- **Role-Based Access Control (RBAC)**: Admin, Doctor, Patient, Pharmacist, etc.
- **Modern UI**: Glassmorphism, 3D animations (Three.js), and smooth transitions (Framer Motion).
- **Dashboard**: Role-specific dashboards with analytics.
- **Appointments**: Scheduling and management.
- **Authentication**: Secure JWT-based auth with HTTP-only cookies.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn/UI, Zustand, Framer Motion, Three.js
- **Backend**: Node.js, Express, TypeScript, Prisma (PostgreSQL), JWT
- **DevOps**: Docker, Docker Compose

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if not using Docker)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd medlife
```

### 2. Environment Variables
Create `.env` file in `backend` folder:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/medlife?schema=public"
JWT_SECRET="your_super_secret_key"
NODE_ENV="development"
```

### 3. Start with Docker (Recommended)
```bash
docker-compose up -d
```
This will start the PostgreSQL database.

### 4. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts  # Seed initial data (Admin/Doctor/Patient)
npm run dev
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials
- **Admin**: `admin@medlife.com` / `admin123`
- **Doctor**: `doctor@medlife.com` / `doctor123`
- **Patient**: `patient@medlife.com` / `patient123`

## Project Structure
- `backend/`: API logic (Controllers, Routes, Services)
- `frontend/`: React application (Pages, Components, Store)

## API Documentation
Endpoints follow RESTful standards.
- `POST /api/auth/login`: Login
- `POST /api/auth/register`: Register
- `GET /api/health`: Health check
