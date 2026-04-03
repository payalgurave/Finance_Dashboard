# Finance Data Processing and Access Control Backend

A full-stack finance dashboard system with role based access control, financial record management, and analytics.

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

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
- MongoDB running locally (or MongoDB Compass)

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

## Roles & Permissions

| Action                   | Viewer | Analyst | Admin |
|--------------------------|--------|---------|-------|
| View financial records   | ✅     | ✅      | ✅    |
| Access dashboard summary | ❌     | ✅      | ✅    |
| Create records           | ❌     | ❌      | ✅    |
| Update records           | ❌     | ❌      | ✅    |
| Delete records           | ❌     | ❌      | ✅    |
| Manage users             | ❌     | ❌      | ✅    |

## API Reference

### Auth
| Method | Endpoint              | Auth |
|--------|-----------------------|------|
| POST   | `/api/auth/register`  | No   |
| POST   | `/api/auth/login`     | No   |
| GET    | `/api/auth/me`        | Yes  |

### Financial Records
| Method | Endpoint           | Roles                   |
|--------|--------------------|-------------------------|
| GET    | `/api/records`     | viewer, analyst, admin  |
| GET    | `/api/records/:id` | viewer, analyst, admin  |
| POST   | `/api/records`     | admin                   |
| PUT    | `/api/records/:id` | admin                   |
| DELETE | `/api/records/:id` | admin                   |

**Filter params:** `type`, `category`, `startDate`, `endDate`, `page`, `limit`

### Dashboard
| Method | Endpoint                  | Roles           |
|--------|---------------------------|-----------------|
| GET    | `/api/dashboard/summary`  | analyst, admin  |

### Users (Admin only)
| Method | Endpoint        |
|--------|-----------------|
| GET    | `/api/users`    |
| GET    | `/api/users/:id`|
| PUT    | `/api/users/:id`|
| DELETE | `/api/users/:id`|

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
| 500    | Server error             |

## Assumptions & Design Decisions

1. **Soft Delete** — Records use `isDeleted: true` flag to preserve audit history. A Mongoose pre-query hook filters them automatically.

2. **Role Assignment on Register** — Any role can be assigned at registration for demo/testing convenience. In production this would be admin-only.

3. **JWT Auth** — Stateless token-based auth stored in localStorage on the frontend.

4. **Dashboard Access** — Viewers are excluded from dashboard summaries as they are raw data consumers only.

5. **MongoDB** — Chosen for flexible schema and native aggregation pipeline support for dashboard queries.

6. **Savings Rate** — Frontend calculates and displays savings rate as `(netBalance / totalIncome) * 100` for quick financial health insight.

7. **Pagination** — Default 10 records per page, configurable via `limit` query param.

## Optional Enhancements Implemented

- ✅ JWT Authentication
- ✅ Pagination for record listing
- ✅ Search / filter support
- ✅ Soft delete functionality
- ✅ React frontend with charts (Area, Pie)
- ✅ Role-based UI (pages and buttons hidden by role)
- ✅ Savings rate analytics
- ✅ Monthly trends (12 months)
- ✅ Category breakdown
