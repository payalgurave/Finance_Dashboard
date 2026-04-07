# Finance Data Processing and Access Control Backend

A full-stack finance dashboard system with role based access control, financial record management, and analytics.

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- express-rate-limit

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- Recharts
- Axios

## Project Structure

```
finance-backend/
├── controllers/         # Request handlers with inline validation
│   ├── authController.js
│   ├── userController.js
│   ├── recordController.js
│   └── dashboardController.js
├── models/              # Mongoose schemas
│   ├── User.js
│   └── FinancialRecord.js
├── routes/              # Express routers
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── recordRoutes.js
│   └── dashboardRoutes.js
├── middleware/          # Auth & role middleware
│   └── auth.js
├── services/            # Business logic
│   ├── authService.js
│   ├── userService.js
│   ├── recordService.js
│   └── dashboardService.js
├── config/
│   └── db.js
├── utils/
│   └── errorHandler.js
├── app.js
└── server.js

finance-frontend/
├── src/
│   ├── api/             # Axios API calls
│   ├── components/      # Reusable UI components
│   ├── context/         # Auth context
│   └── pages/           # Login, Register, Dashboard, Records, Users
```

## Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB running locally (or MongoDB Atlas)

### Backend Setup

```bash
cd finance-backend
npm install
# .env is already configured for localhost
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd finance-frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

---

## Testing the Application

Once both servers are running, open `http://localhost:5173` in your browser.

### Step 1 — Seed the database (recommended)

Instead of manually creating accounts, run the seed script:

```bash
cd finance-backend
npm run seed
```

This creates 3 test users and 50 financial records automatically.

### Test Credentials (after seeding)

| Name         | Email                  | Password   | Role     |
|--------------|------------------------|------------|----------|
| Admin User   | admin@test.com         | admin123   | Admin    |
| Analyst User | analyst@test.com       | analyst123 | Analyst  |
| Viewer User  | viewer@test.com        | viewer123  | Viewer   |

### Step 2 — Add sample financial records

Log in as **Admin** and go to the Records page. Click **New Record** and add a few sample entries:

| Amount  | Type    | Category   | Date       |
|---------|---------|------------|------------|
| 50000   | income  | Salary     | 2025-01-01 |
| 12000   | expense | Rent       | 2025-01-05 |
| 3000    | expense | Food       | 2025-01-10 |
| 8000    | income  | Freelance  | 2025-02-01 |
| 2000    | expense | Transport  | 2025-02-10 |

### Step 3 — Test role-based access

| Action                        | Admin | Analyst | Viewer |
|-------------------------------|-------|---------|--------|
| View Records page             | ✅    | ✅      | ✅     |
| Create / Edit / Delete record | ✅    | ❌      | ❌     |
| View Dashboard with charts    | ✅    | ✅      | ❌     |
| Export records as CSV         | ✅    | ✅      | ❌     |
| Manage Users page             | ✅    | ❌      | ❌     |

### Step 4 — Test API directly (optional)

You can also test the API using Postman or curl:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"admin123","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Health check
curl http://localhost:5000/api/health
```

---

## Roles & Permissions

| Action                   | Viewer | Analyst | Admin |
|--------------------------|--------|---------|-------|
| View financial records   | ✅     | ✅      | ✅    |
| Access dashboard summary | ❌     | ✅      | ✅    |
| Create records           | ❌     | ❌      | ✅    |
| Update records           | ❌     | ❌      | ✅    |
| Delete records           | ❌     | ❌      | ✅    |
| Export CSV               | ❌     | ✅      | ✅    |
| Manage users             | ❌     | ❌      | ✅    |

## API Reference

### Auth
| Method | Endpoint              | Auth |
|--------|-----------------------|------|
| POST   | `/api/auth/register`  | No   |
| POST   | `/api/auth/login`     | No   |
| GET    | `/api/auth/me`        | Yes  |

### Financial Records
| Method | Endpoint                | Roles                   |
|--------|-------------------------|-------------------------|
| GET    | `/api/records`          | viewer, analyst, admin  |
| GET    | `/api/records/export`   | analyst, admin          |
| GET    | `/api/records/:id`      | viewer, analyst, admin  |
| POST   | `/api/records`          | admin                   |
| PUT    | `/api/records/:id`      | admin                   |
| DELETE | `/api/records/:id`      | admin                   |

**Filter & Search params:** `type`, `category`, `startDate`, `endDate`, `search`, `page`, `limit`

### Dashboard
| Method | Endpoint                  | Roles           |
|--------|---------------------------|-----------------|
| GET    | `/api/dashboard/summary`  | analyst, admin  |

### Users (Admin only)
| Method | Endpoint         |
|--------|------------------|
| GET    | `/api/users`     |
| GET    | `/api/users/:id` |
| PUT    | `/api/users/:id` |
| DELETE | `/api/users/:id` |

### Health Check
| Method | Endpoint       |
|--------|----------------|
| GET    | `/api/health`  |

## Error Response Format

```json
{ "success": false, "message": "Error description" }
```

| Status | Meaning                  |
|--------|--------------------------|
| 400    | Bad request / validation |
| 401    | Unauthorized             |
| 403    | Forbidden (wrong role)   |
| 404    | Not found                |
| 409    | Duplicate (email exists) |
| 429    | Too many requests        |
| 500    | Server error             |

## Assumptions & Design Decisions

1. **Soft Delete** — Records use `isDeleted: true` flag to preserve audit history. A Mongoose pre-query hook filters them automatically.

2. **Role Assignment on Register** — Any role can be assigned at registration for demo/testing convenience. In production this would be admin-only.

3. **JWT Auth** — Stateless token-based auth stored in localStorage on the frontend.

4. **Dashboard Access** — Viewers are excluded from dashboard summaries as they are raw data consumers only.

5. **MongoDB** — Chosen for flexible schema and native aggregation pipeline support for dashboard queries.

6. **Pagination** — Default 10 records per page, configurable via `limit` query param.

7. **Rate Limiting** — Global limit of 100 requests per 15 min. Auth routes are stricter at 20 requests per 15 min to prevent brute force attacks.

8. **Self-protection** — Admins cannot delete or modify their own account to prevent accidental lockout.

## Optional Enhancements Implemented

- ✅ JWT Authentication
- ✅ Pagination for record listing
- ✅ Search support (searches category and notes)
- ✅ Soft delete functionality
- ✅ Rate limiting (global + auth-specific)
- ✅ CSV export for records (analyst + admin)
- ✅ React frontend with charts (Bar, Pie)
- ✅ Role-based UI (pages and buttons hidden by role)
- ✅ Monthly trends (last 12 months)
- ✅ Category breakdown
- ✅ DB health check endpoint
