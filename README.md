# Centre Medical Danan — Patient Portal

A full-stack, production-ready Patient Portal for an ophthalmology clinic built with **React + TailwindCSS** (frontend) and **Node.js + Express + Prisma + PostgreSQL** (backend).

## Features

- **Authentication** — Login, Signup, JWT token refresh, protected routes
- **Dashboard** — Overview of appointments, results, and prescriptions
- **Appointments** — View, book, and cancel appointments with available time slots
- **Prescriptions** — View active/past prescriptions, request renewals
- **Test Results** — View exam results with status indicators and trend tracking
- **Medical Records** — Overview, history, vaccinations, and document management
- **Document Upload** — Upload and manage medical documents (PDF, images, DOC)
- **AI Assistant** — Chatbot for ophthalmology questions and portal guidance
- **Contact Page** — Clinic info, medical team, emergency contacts
- **Profile Management** — Update personal info, avatar, and password
- **Notifications** — Real-time notification bell with unread indicators
- **404 Page** — Custom error page with navigation

## Design

- Color palette: `#2FA4D7`, `#111FA2`, `#EBF4F6`, `#3F9AAE`
- Typography: DM Sans + Plus Jakarta Sans
- Modern, clean, medical aesthetic with rounded components
- Responsive — works on mobile, tablet, and desktop
- Smooth page transitions and micro-interactions

## 🛠 Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, React Router 7, TailwindCSS, Axios  |
| Backend  | Node.js, Express 4, Prisma ORM, JWT, bcrypt   |
| Database | PostgreSQL                                     |
| Dev      | Vite, ESModules                                |

## 📁 Project Structure

```
patient-portal/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── middleware/auth.js      # JWT authentication
│   │   ├── routes/                 # All API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   ├── prescription.routes.js
│   │   │   ├── testResult.routes.js
│   │   │   ├── medicalRecord.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── upload.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── profile.routes.js
│   │   ├── prisma/seed.js          # Demo data seeder
│   │   ├── utils/response.js       # Response helpers
│   │   └── server.js               # Express entry point
│   ├── .env                        # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/             # Sidebar, Header, MainLayout
│   │   ├── context/AuthContext.jsx  # Authentication context
│   │   ├── hooks/useNotifications.js
│   │   ├── lib/api.js              # Axios wrapper with refresh
│   │   ├── pages/                  # All pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Prescriptions.jsx
│   │   │   ├── TestResults.jsx
│   │   │   ├── MedicalRecords.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx                 # Router + Auth guard
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind + custom styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally (or via Docker)
- **npm** or **yarn**

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/patient_portal?schema=public"
JWT_SECRET="change-me-in-production"
JWT_REFRESH_SECRET="change-me-too"
```

### 3. Setup database

```bash
cd backend

# Create the database first (if needed):
# createdb patient_portal

# Generate Prisma client, push schema, and seed
npm run setup
```

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### 5. Login with demo account

```
Email:    test@demo.com
Password: Test1234
```

## API Routes

| Method | Route                              | Description                  |
|--------|-------------------------------------|------------------------------|
| POST   | `/api/auth/signup`                 | Create new account           |
| POST   | `/api/auth/login`                  | Login                        |
| POST   | `/api/auth/refresh`                | Refresh access token         |
| GET    | `/api/auth/me`                     | Get current user             |
| GET    | `/api/dashboard`                   | Dashboard aggregation        |
| GET    | `/api/appointments`                | List user appointments       |
| GET    | `/api/appointments/doctors`        | List available doctors       |
| GET    | `/api/appointments/slots`          | Get available time slots     |
| POST   | `/api/appointments`                | Book appointment             |
| DELETE | `/api/appointments/:id`            | Cancel appointment           |
| GET    | `/api/prescriptions`               | List prescriptions           |
| GET    | `/api/prescriptions/renewals`      | List renewal requests        |
| POST   | `/api/prescriptions/:id/renew`     | Request renewal              |
| GET    | `/api/test-results`                | List test results            |
| GET    | `/api/test-results/summary`        | Results summary              |
| GET    | `/api/test-results/:id`            | Single result detail         |
| GET    | `/api/medical-records`             | List medical records         |
| GET    | `/api/medical-records/vaccinations`| List vaccinations            |
| GET    | `/api/medical-records/documents`   | List uploaded documents      |
| GET    | `/api/notifications`               | List notifications           |
| GET    | `/api/notifications/unread-count`  | Unread count                 |
| PUT    | `/api/notifications/:id/read`      | Mark notification as read    |
| PUT    | `/api/notifications/read-all`      | Mark all as read             |
| POST   | `/api/upload`                      | Upload medical document      |
| POST   | `/api/upload/avatar`               | Upload profile avatar        |
| PUT    | `/api/profile`                     | Update user profile          |
| PUT    | `/api/profile/password`            | Change password              |

## 🗄 Database Schema

**Models:** `User`, `Appointment`, `Prescription`, `PrescriptionRenewal`, `TestResult`, `MedicalRecord`, `Notification`, `Doctor`

## Seed Data

The seed creates:
- 1 demo user (test@demo.com / Test1234) with full profile
- 3 doctors with specialties and available slots
- 6 appointments (3 upcoming, 3 past)
- 4 prescriptions (3 active, 1 completed) + 1 renewal
- 6 test results with detailed JSON data
- 4 medical records including a vaccination
- 5 notifications of different types

---

Built with love by Moran for **Centre Medical Danan** 
