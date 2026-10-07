# Smart Student Task & Attendance Management System

A MERN-stack web application that helps students track subject-wise attendance and manage
assignments and deadlines from a single dashboard.

## Features

- Register and log in (JWT authentication, bcrypt-hashed passwords)
- Add, edit and delete subjects
- Track attendance per subject, with one-click "present" / "absent" updates
- Attendance percentage calculated automatically (never stored in the database)
- Shortage warning when a subject falls below 75%
- 75% helper: shows how many classes to attend to reach 75%, or how many can still be missed
- Add, edit, complete and delete tasks with deadlines
- Tasks can optionally be linked to a subject
- Task filters: All / Pending / Completed / Overdue
- "Due soon" (within 2 days) and "Overdue" highlighting
- Dashboard with statistic cards, attendance bar chart, task donut chart and upcoming tasks
- Responsive layout (sidebar on desktop, collapsible menu on mobile)
- Light and dark mode (remembered in the browser)
- Each user can only see and change their own data

## Tech Stack

| Layer          | Technology                                                            |
| -------------- | --------------------------------------------------------------------- |
| Frontend       | React, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide icons |
| Backend        | Node.js, Express.js                                                   |
| Database       | MongoDB (Atlas or local) with Mongoose                                |
| Authentication | JSON Web Tokens (JWT), bcryptjs                                       |

## Project Structure

```
├── client/                 React frontend
│   └── src/
│       ├── components/     Reusable UI (cards, modal, forms, charts)
│       ├── pages/          Login, Register, Dashboard, Attendance, Tasks
│       ├── layouts/        Sidebar layout for logged-in pages
│       ├── services/       Axios instance and small helper functions
│       ├── context/        AuthContext (token + user in localStorage)
│       ├── App.jsx         Routes and protected route
│       └── main.jsx
│
└── server/                 Express backend
    ├── config/             MongoDB connection
    ├── models/             User, Subject, Task
    ├── controllers/        Request handlers
    ├── routes/             API routes
    ├── middleware/         JWT auth middleware
    ├── seed.js             Demo data script
    └── server.js           App entry point and error handler
```

## Setup

Requirements: Node.js 20+ and a MongoDB database (a free MongoDB Atlas cluster or a local MongoDB).

```bash
git clone <repository-url>
cd <repository-folder>
```

### Backend

```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
CLIENT_URL=
```

- `CLIENT_URL` – URL of the deployed frontend (for CORS); leave empty for local development
- `MONGO_URI` – Atlas connection string, or `mongodb://127.0.0.1:27017/smart-student-tracker` for a local MongoDB
- `JWT_SECRET` – any long random string

### Frontend

```bash
cd client
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

`client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Open http://localhost:5173.

### Demo data (optional)

```bash
cd server
npm run seed
```

This creates a demo account with 6 subjects and 10 tasks (mixed attendance, pending, completed and
overdue tasks). Log in with:

```
Email:    demo@student.com
Password: demo123
```

Running it again resets only the demo account.

## API Endpoints

All routes except register and login need the header `Authorization: Bearer <token>`.

| Method | Endpoint                       | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| GET    | `/api/health`                  | Check that the API is running            |
| POST   | `/api/auth/register`           | Create an account                        |
| POST   | `/api/auth/login`              | Log in, returns `{ token, user }`        |
| GET    | `/api/subjects`                | List subjects                            |
| POST   | `/api/subjects`                | Add a subject                            |
| PUT    | `/api/subjects/:id`            | Edit a subject                           |
| PUT    | `/api/subjects/:id/attendance` | Update attended / total classes          |
| DELETE | `/api/subjects/:id`            | Delete a subject                         |
| GET    | `/api/tasks`                   | List tasks                               |
| POST   | `/api/tasks`                   | Add a task                               |
| PUT    | `/api/tasks/:id`               | Edit a task                              |
| PATCH  | `/api/tasks/:id/status`        | Set status to `pending` or `completed`   |
| DELETE | `/api/tasks/:id`               | Delete a task                            |
| GET    | `/api/dashboard`               | Totals, overall attendance, upcoming tasks |

### How attendance is calculated

- Per subject: `attendedClasses / totalClasses * 100` (shown as `N/A` when total classes is 0)
- 75% helper, with `a` attended out of `t` classes: below 75% you must attend the next `3t - 4a`
  classes; otherwise you can miss `floor((4a - 3t) / 3)` more. Check it with
  `node client/src/services/helpers.check.js`.
- Overall: `sum(attendedClasses) / sum(totalClasses) * 100`, **not** the average of the subject
  percentages. Example: 9/10 and 50/100 gives 59/110 = 53.6%, not (90 + 50) / 2 = 70%.

## Deployment

Frontend on Vercel, backend on Render, database on MongoDB Atlas.

**1. MongoDB Atlas** – create a free cluster, add a database user, allow access from anywhere
(`0.0.0.0/0`) under Network Access, and copy the connection string. Put a database name before
the `?`, for example `...mongodb.net/smart-student-tracker?retryWrites=true&w=majority`.

**2. Render (backend)** – New → Web Service → pick the GitHub repo.

| Setting        | Value         |
| -------------- | ------------- |
| Root Directory | `server`      |
| Build Command  | `npm install` |
| Start Command  | `npm start`   |

Environment variables: `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (add this one after step 3).
Do not set `PORT`; Render provides it.

**3. Vercel (frontend)** – New Project → pick the same repo.

| Setting          | Value           |
| ---------------- | --------------- |
| Root Directory   | `client`        |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

Environment variable: `VITE_API_URL=https://<render-backend-url>/api`

**4. Connect them** – set `CLIENT_URL` on Render to the Vercel URL (no trailing slash needed) and
let Render redeploy. If `VITE_API_URL` is changed later, redeploy on Vercel, because Vite reads it
at build time.

`client/vercel.json` sends every path to `index.html`, so refreshing `/dashboard`, `/attendance`
or `/tasks` works. On Render's free plan the backend sleeps when idle, so the first request after
a pause can take up to a minute.

## Screenshots

_Add screenshots here._

| Dashboard | Attendance | Tasks |
| --------- | ---------- | ----- |
|           |            |       |
