# 🏋️ Gym Membership Application

A complete, fully functional full-stack **MERN** web application for managing gym membership packages. Users can browse and search membership plans, register/login, and apply for memberships. Admins can manage memberships, users, and applications and view live dashboard statistics — all persisted in **MongoDB**.

This is a real working application: every page talks to the Express REST API and every operation is stored in MongoDB. Refresh the browser and the data remains. Add a membership in the admin dashboard and it appears in MongoDB Compass.

---

## ✨ Features

### Public / User
- Modern gym landing page (hero, highlights, popular plans, CTA)
- Membership catalog with **backend search, category filter, price filter, duration filter and sorting**
- Membership details page with feature list and pricing
- Register (name, email, phone, password, confirm password) with dual client/server validation
- Login with JWT authentication
- Apply-for-membership confirmation modal (shows plan, duration, price, features)
- Duplicate pending/active application protection per membership
- User dashboard: welcome message, profile info, live stats (total / pending / active / expired applications)
- My Memberships page: price, applied date, start/end date, status, payment status
- Profile page: view and update name / email / phone (role cannot be changed by users)
- Change password
- Toast notifications for success and error events
- Loading, empty and error states on every API-driven page

### Admin
- Role-based admin login (`admin@gym.com`)
- Dashboard with **dynamic MongoDB statistics**: total users, memberships, applications, pending, active, revenue collected, recent applications, status breakdown
- Membership management: create, edit, delete/deactivate with confirmation modals, search, category filter
- Safe deletion: memberships with existing subscriptions are **deactivated instead of deleted**
- User management: list users with name, email, phone, role, registered date; admin cannot demote themselves
- Application management: view details, approve, reject, activate (auto-computes end date from plan duration), mark payment paid/unpaid
- Status lifecycle: `pending → approved → active → expired`, `pending → rejected`
- Responsive admin layout with collapsible sidebar

### Security
- JWT authentication (Bearer tokens)
- bcryptjs password hashing (passwords never returned by the API, `select: false`)
- `authenticateUser` + `requireAdmin` middleware — **all admin APIs enforced server-side**
- express-validator input validation on every write endpoint
- MongoDB ObjectId validation (invalid ids → 404/400, never crashes)
- CORS restricted to `CLIENT_URL`
- Centralized error handler with consistent JSON envelope
- `.env` git-ignored; secrets never hardcoded

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router DOM 6, Axios, Tailwind CSS 3, Lucide React |
| Backend | Node.js, Express 4, Mongoose 8, JSONWebToken, bcryptjs, express-validator, dotenv, cors |
| Database | MongoDB (local) + MongoDB Compass |
| Tooling | nodemon, concurrently |

---

## 🏗 Architecture

```
Browser (React SPA on :5173)
        │  Axios  +  Authorization: Bearer <JWT>
        ▼
Express REST API (:5000)   routes → validation → middleware → controllers
        │  Mongoose
        ▼
MongoDB (127.0.0.1:27017)  database: gym_membership
```

- **Frontend and backend are fully separated** — separate `package.json`, separate dev servers.
- The API returns a consistent envelope:
  - Success: `{ "success": true, "message": "...", "data": ... }`
  - Error: `{ "success": false, "message": "..." }`

---

## 📁 Folder Structure

```
gym-membership/
│
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, MembershipCard, DataTable, Modal, ...
│   │   ├── pages/              # Home, Memberships, Login, Dashboard, Profile, ...
│   │   │   └── admin/          # AdminDashboard, AdminMemberships, AdminUsers, AdminApplications
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── services/           # axios instance + authService, membershipService, ...
│   │   ├── hooks/              # useDebounce, useDocumentTitle
│   │   ├── utils/              # formatters, client validators
│   │   ├── App.jsx             # routes
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Express backend
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # auth, membership, application, admin* controllers
│   ├── middleware/             # auth, error, validation
│   ├── models/                 # User, Membership, Subscription
│   ├── routes/                 # authRoutes, membershipRoutes, applicationRoutes, adminRoutes
│   ├── utils/                  # token, date helpers, validators
│   ├── seed/                   # seedAdmin.js, seedMemberships.js
│   ├── tests/                  # api.test.mjs (75-check API test suite)
│   ├── server.js
│   ├── .env / .env.example
│   └── package.json
│
├── package.json                # root: npm run dev (concurrently)
├── README.md
└── .gitignore
```

---

## 📋 Requirements

- **Node.js** 18+ (tested on Node 22)
- **MongoDB Community Server** 6+ running locally on `127.0.0.1:27017`
- **MongoDB Compass** (for viewing the database)
- npm

---

## ⚙️ Installation

```bash
# 1. Install backend dependencies
cd server
npm install

# 2. Install frontend dependencies
cd ../client
npm install

# 3. (Optional) install root dev script dependency
cd ..
npm install
```

---

## 🗄 MongoDB Setup

1. Install **MongoDB Community Server** from mongodb.com.
2. Install **MongoDB Compass**.
3. Start the MongoDB service:
   - **Windows:** `net start MongoDB` (or start it from Services)
   - **macOS:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
4. Verify it is listening on port `27017`.

The backend connects using the URI in `server/.env`. On a successful connection it prints:

```
MongoDB connected successfully
```

If MongoDB is unavailable it prints a clear connection error — it does not fail silently.

### MongoDB Compass setup

1. Open MongoDB Compass.
2. Connect using:

```
mongodb://127.0.0.1:27017
```

3. The database `gym_membership` is created automatically the first time the backend writes data.
4. Collections appear after data is inserted (run the seed scripts or use the app):

```
gym_membership
 ├── users
 ├── memberships
 └── subscriptions
```

---

## 🔐 Environment Variables

`server/.env` (already created for local dev; `.env.example` is the committed template):

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gym_membership
JWT_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string (database name: `gym_membership`) |
| `JWT_SECRET` | Secret used to sign JWTs — **keep it private** |
| `CLIENT_URL` | Allowed CORS origin (the Vite dev server) |

`.env` is listed in `.gitignore` and is never committed.

---

## 🚀 Running the Application

### Terminal A — Backend

```bash
cd server
npm install
npm run dev        # nodemon, http://localhost:5000
```

Expected output:

```
MongoDB connected successfully
Server running on port 5000
```

### Terminal B — Frontend

```bash
cd client
npm install
npm run dev        # Vite, http://localhost:5173
```

### Or both at once (from project root)

```bash
npm install        # installs concurrently
npm run dev        # starts server + client together
```

---

## 🌱 Seeding

### Create the admin account

```bash
cd server
npm run seed:admin
```

- Hashes the password with bcrypt (never stored in plain text).
- Idempotent: if the admin already exists it reports that and creates no duplicate.

### Create sample memberships

```bash
cd server
npm run seed:memberships     # or: npm run seed
```

- Inserts sample plans (Basic, Student, Premium, Gold, Annual, Quarterly, Personal Training, Corporate) **only if the memberships collection is empty**.

---

## 🔑 Default Admin Credentials

```
Email:    admin@gym.com
Password: Admin@123
```

> Change this in a real deployment by updating the admin's password from the profile screen.

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

All responses use the envelope `{ success, message, data }`.
Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (name, email, phone, password, confirmPassword) |
| POST | `/api/auth/login` | Public | Login, returns `{ user, token }` |
| GET | `/api/auth/me` | Logged in | Current user from token |
| PUT | `/api/auth/profile` | Logged in | Update name / email / phone (role never updatable by users) |
| PUT | `/api/auth/change-password` | Logged in | Change password (verifies current password) |

### Memberships (public)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/memberships` | Public | Active plans. Query: `search`, `category`, `minPrice`, `maxPrice`, `duration`, `sort` (`price_asc`, `price_desc`, `newest`, `name`), `page`, `limit` |
| GET | `/api/memberships/:id` | Public | Single plan (404 for invalid/inactive id) |

### Applications (logged-in user)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/applications` | Logged in | Apply for a membership (body: `membershipId`) → status `pending`, payment `unpaid` |
| GET | `/api/applications/my` | Logged in | Own applications (expired ones are lazily flipped to `expired` on read) |
| GET | `/api/applications/:id` | Owner/Admin | Single application detail |

### Admin (admin role required — enforced server-side)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Dynamic MongoDB statistics |
| GET | `/api/admin/memberships` | All plans including inactive |
| POST | `/api/admin/memberships` | Create plan |
| PUT | `/api/admin/memberships/:id` | Update plan |
| DELETE | `/api/admin/memberships/:id` | Delete plan; auto-deactivates instead if subscriptions exist |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | Single user |
| GET | `/api/admin/applications` | All applications (populate user + membership) |
| PUT | `/api/admin/applications/:id/status` | `pending→approved`, `pending→rejected`, `approved→active` (sets startDate/endDate from plan duration), force to `expired` |
| PUT | `/api/admin/applications/:id/payment` | Mark `paid` / `unpaid` |

### Status codes

`200` ok · `201` created · `400` validation · `401` unauthenticated · `403` forbidden (non-admin) · `404` not found · `409` duplicate/conflict · `500` server error

---

## 🧪 Testing

### Automated API suite (76 checks)

```bash
cd server
npm test
```

Covers: register, duplicate email, login, wrong password, `GET /me`, membership CRUD + search/filter, application lifecycle (submit → approve → activate with computed end date → mark paid), user list, dashboard stats, security (unauthenticated → 401, normal user on admin APIs → 403, invalid ObjectIds → safe 400/404, password never leaked).

Additional lifecycle check (reject transition + lazy expiry, 13 checks, cleans up after itself):

```bash
cd server
npm run test:lifecycle
```

### Manual checklist

- **Auth:** register, duplicate email rejected, login, invalid password, refresh keeps session, logout
- **User:** browse/search/filter memberships, view details, apply, view applications, update profile
- **Admin:** login, dynamic dashboard, add/edit/delete-deactivate membership, view users, approve/reject/activate application, mark payment paid
- **Database:** register → `users` collection; apply → `subscriptions`; admin create → `memberships`; data persists after refresh (verify in Compass)

---

## 📸 Screenshots

> Placeholder — add screenshots here after running the app:
>
> - Home page
> - Memberships with search/filter
> - Membership details + apply modal
> - Register / Login
> - User dashboard
> - Admin dashboard
> - Admin membership management
> - Admin applications

---

## 🔮 Future Enhancements

- Real payment gateway integration (Razorpay/Stripe) for `paymentStatus`
- Email notifications on application approval/rejection
- Membership renewal and reminders
- QR-based gym check-in
- Trainer booking and class schedule
- Role-based admin permissions (super admin vs staff)
- Automated expiry cron job (currently lazy expiry on read)
- Unit/E2E test coverage with Jest + Cypress

---

## 📜 License

MIT
