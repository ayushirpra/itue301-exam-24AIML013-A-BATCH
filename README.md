# DriveEasy — Car Rental System

> ITUE301 Advanced Web Development Frameworks — Practical Exam Project
> React + Vite, React Router, Express.js, MongoDB + Mongoose

A full-stack car rental application where customers log in, browse a fleet of
vehicles, book a car by selecting pickup and return dates, and manage their
bookings. An admin panel shows fleet statistics and booking history.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Applications](#running-the-applications)
- [MongoDB Configuration](#mongodb-configuration)
- [API Endpoints](#api-endpoints)
- [Seed Data](#seed-data)
- [Frontend Features](#frontend-features)
- [Viva Explanation](#viva-explanation)

---

## Tech Stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Frontend     | React 18, Vite 5, React Router 6             |
| Backend      | Express.js 4, Node.js                       |
| Database     | MongoDB + Mongoose                          |
| Auth         | JSON Web Tokens (JWT), Bearer token          |

---

## Project Structure

```
AWDF REmid/
├── .gitignore               # excludes node_modules, .env, dist
├── .env.example             # sample env vars for both frontend & backend
├── README.md
├── backend/
│   ├── server.js            # Express app entry point (npm start)
│   ├── seed.js              # prints / seeds sample data
│   ├── package.json
│   ├── .env                 # backend env (NOT committed)
│   ├── .env.example
│   ├── config/
│   │   └── db.js            # Mongoose connection helper
│   ├── data/
│   │   └── store.js         # (deprecated) former in-memory store, kept for reference
│   ├── models/
│   │   ├── Customer.js      # Mongoose schema (active)
│   │   ├── Vehicle.js       # Mongoose schema (active)
│   │   └── Booking.js       # Mongoose schema (active)
│   ├── middleware/
│   │   ├── requestLogger.js  # global request logger
│   │   ├── authGuard.js      # Bearer-token validation
│   │   └── errorHandler.js   # structured error middleware
│   └── routes/
│       ├── authRoutes.js     # POST /api/v1/auth/login
│       ├── vehicleRoutes.js  # GET  /api/v1/vehicles
│       └── bookingRoutes.js  # POST/GET/PATCH bookings
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env                 # frontend env (NOT committed)
    ├── .env.example
    └── src/
        ├── main.jsx         # app entry, BrowserRouter + AuthProvider
        ├── App.jsx          # routes, React.lazy(AdminPanel), Suspense
        ├── api.js           # fetch wrapper with Bearer token
        ├── index.css        # styles
        ├── context/
        │   └── AuthContext.jsx   # { customer, token, login, logout }
        ├── components/
        │   ├── ProtectedRoute.jsx # redirects to "/" if not authenticated
        │   ├── Navbar.jsx        # client-side nav links
        │   └── VehicleCard.jsx   # reusable card (model, type, price, Book/NA)
        └── pages/
            ├── LoginPage.jsx
            ├── FleetPage.jsx       # filters, useEffect fetch, booking form
            ├── MyBookingsPage.jsx   # populated bookings, status update
            └── AdminPanel.jsx      # lazy-loaded stats + tables
```

---

## Database

The application uses **MongoDB via Mongoose** for all data persistence.
Customers, vehicles, and bookings are stored in the `driveeasy` database.
The server connects automatically on startup using `MONGO_URI` from `.env`.

The file `backend/data/store.js` is a deprecated in-memory store kept for
reference only — it is no longer imported by any route or middleware.

---

## Setup & Installation

### Prerequisites

- Node.js 18+ (tested on Node 24)
- npm 9+

### 1. Clone & install

```bash
# from the repository root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and set MONGO_URI and JWT_SECRET

# Frontend
cp frontend/.env.example frontend/.env
# Frontend defaults to http://localhost:5000/api/v1
```

---

## Running the Applications

Open **two terminals** — one for the backend, one for the frontend.

### Backend (terminal 1)

```bash
cd backend
npm start          # or: node server.js
```

Server runs on `http://localhost:5000`.

### Frontend (terminal 2)

```bash
cd frontend
npm run dev
```

Vite dev server runs on `http://localhost:5173` and opens automatically.

### Demo login

| Email                  | Password      |
|------------------------|---------------|
| ayushi@example.com     | password123   |
| rahul@example.com      | password123   |

---

## MongoDB Configuration

Set the following in `backend/.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/driveeasy
JWT_SECRET=your_secret_key_here
PORT=5000
```

For MongoDB Atlas, use the Atlas connection string:
```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/driveeasy
```

Seed the database with sample data:
```bash
cd backend
npm run seed
```

---

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

| # | Method | Path                        | Auth | Description                                      |
|---|--------|-----------------------------|------|--------------------------------------------------|
| 1 | POST   | `/auth/login`               | No   | Validates email/password, returns JWT + customer |
| 2 | GET    | `/vehicles`                 | No   | Returns all vehicles (optional `?type=` filter)  |
| 3 | POST   | `/bookings`                 | Yes  | Creates a booking, marks vehicle unavailable      |
| 4 | GET    | `/bookings/my`              | Yes  | Returns logged-in user's bookings (populated)    |
| 5 | PATCH  | `/bookings/:id/status`      | Yes  | Updates booking status; releases vehicle on end  |

### Request/Response Examples

**POST /api/v1/auth/login**
```json
// Request
{ "email": "ayushi@example.com", "password": "password123" }

// Response 200
{ "success": true, "token": "eyJhbG...", "customer": { "id": "6ad9...", "name": "Ayushi Patel", "email": "ayushi@example.com" } }
```

**POST /api/v1/bookings** (Authorization: Bearer `<token>`)
```json
// Request
{ "vehicle": "6ad9843a...", "pickupDate": "2026-11-01", "returnDate": "2026-11-05" }

// Response 201
{ "success": true, "message": "Booking created successfully.", "data": { "_id": "6ad99843...", "customer": "6ad9843a...", "vehicle": "6ad9843a...", "pickupDate": "...", "returnDate": "...", "totalAmount": 7200, "status": "reserved" } }
```

**GET /api/v1/bookings/my** (Authorization: Bearer `<token>`)
```json
// Response 200 — customer and vehicle are populated
{ "success": true, "count": 1, "data": [{ "_id": "6ad99843...", "customer": { "name": "Ayushi Patel", "email": "ayushi@example.com" }, "vehicle": { "model": "Maruti Swift", "type": "Hatchback", "pricePerDay": 1800 }, "status": "reserved" }] }
```

**PATCH /api/v1/bookings/:id/status**
```json
// Request
{ "status": "cancelled" }   // one of: reserved, ongoing, completed, cancelled

// Response 200 — vehicle becomes available again
{ "success": true, "message": "Booking status updated.", "data": { ... } }
```

### Error Handling

| Status | Meaning                              |
|--------|--------------------------------------|
| 400    | Missing/invalid fields in request     |
| 401    | Missing or invalid Bearer token       |
| 403    | Not authorized for this resource      |
| 404    | Vehicle or booking not found          |
| 409    | Vehicle not available for booking     |
| 500    | Internal server error                 |

---

## Seed Data

Run `npm run seed` in the `backend` directory to populate MongoDB with:

**2 customers:**
- Ayushi Patel — ayushi@example.com / password123
- Rahul Sharma — rahul@example.com / password123

**6 vehicles:**
| Model              | Type      | Price/day | Available |
|--------------------|-----------|-----------|----------|
| Maruti Swift       | Hatchback | ₹1,800    | Yes      |
| Hyundai i20        | Hatchback | ₹2,000    | Yes      |
| Honda City         | Sedan     | ₹3,000    | Yes      |
| Skoda Octavia      | Sedan     | ₹3,500    | No       |
| Mahindra Scorpio   | SUV       | ₹4,000    | Yes      |
| Tata Harrier       | SUV       | ₹4,200    | Yes      |

---

## Frontend Features

- **LoginPage** — email/password form, stores JWT + customer in localStorage
- **FleetPage** — fetches vehicles via `useEffect` (loading/error/data states), client-side filters (All / Hatchback / Sedan / SUV), booking modal form with `useState`
- **MyBookingsPage** — shows populated bookings (customer name/email, vehicle model/type), status dropdown
- **AdminPanel** — lazy-loaded via `React.lazy` + `Suspense`, fleet stats + tables
- **VehicleCard** — reusable component showing model, type, price/day, "Book Now" or "Not Available"
- **AuthContext** — provides `{ customer, token, login, logout, isAuthenticated }`
- **ProtectedRoute** — redirects unauthenticated users to `/`
- **Navbar** — client-side `<Link>` / `<NavLink>` (no page reloads)
- **React Router** — routes: `/`, `/fleet`, `/my-bookings`, `/admin`

---

## Viva Explanation

### Task-by-task summary

**Frontend Task 1 — Pages & Components**
Created `LoginPage`, `FleetPage`, `MyBookingsPage`, and a reusable
`VehicleCard`. Each page is a functional component using hooks.

**Frontend Task 2 — Routing**
`App.jsx` configures four routes (`/`, `/fleet`, `/my-bookings`, `/admin`)
with React Router 6's `<Routes>` and `<Route>` elements.

**Frontend Task 3 — AuthContext & ProtectedRoute**
`AuthContext.jsx` stores `{ customer, token }` in state + localStorage.
`ProtectedRoute` checks `isAuthenticated` and redirects to `/` with
`<Navigate>` if no token is present.

**Frontend Task 4 — Navigation without reload**
`Navbar.jsx` uses `<Link>` and `<NavLink>` from React Router for client-side
navigation — no full page reloads.

**Frontend Task 5 — Booking form with useState**
`FleetPage` manages `selectedVehicle`, `pickupDate`, `returnDate` with
`useState`. The modal form submits to `POST /api/v1/bookings`.

**Frontend Task 6 — Lazy-load AdminPanel**
`AdminPanel` is imported with `React.lazy(() => import(...))` and wrapped in
`<Suspense>`, producing a separate Vite chunk (`AdminPanel-*.js`).

**Frontend Task 7 — Fetch with useEffect**
`FleetPage` uses `useEffect` to call `GET /api/v1/vehicles`, managing
`loading`, `error`, and `vehicles` states.

**Frontend Task 8 — Client-side filters**
Filter buttons (All, Hatchback, Sedan, SUV) update a `filter` state that
filters the vehicle array before rendering through `VehicleCard`, which shows
model, type, price/day, and either "Book Now" or "Not Available".

**Backend Task 1 — server.js & Mongoose**
`server.js` sets up Express with `cors`, `express.json`, the request logger,
route mounting, and the error handler. Mongoose connects to MongoDB on startup
via `config/db.js` using `MONGO_URI` from `.env`.

**Backend Task 2 — Schemas**
`Customer` (name, email-unique, password), `Vehicle` (model, type-enum,
pricePerDay-min, registrationNumber-unique, available-boolean-default-true),
`Booking` (customer-ref, vehicle-ref, pickupDate, returnDate, totalAmount,
status-enum: reserved/ongoing/completed/cancelled-default-reserved).

**Backend Task 3 — Five endpoints**
Login, list vehicles, create booking, list my bookings, update status.

**Backend Task 4 — Middleware**
`requestLogger` logs method + path + timestamp globally. `authGuard`
validates the Bearer token via `jwt.verify` and attaches the customer.
`errorHandler` returns structured JSON errors as the final middleware.

**Backend Task 5 — Booking flow**
On `POST /bookings`: verify vehicle exists → check `available === true` →
calculate `totalAmount` from date range × price/day → create booking →
mark vehicle `available = false`. Returns 409 if unavailable, 404 if not
found.

**Backend Task 6 — Populate**
`GET /bookings/my` uses Mongoose `.populate()` to join customer name/email and
vehicle model/type into each booking document.

**Backend Task 7 — Scripts**
`package.json` has `"start": "node server.js"` so `npm start` works.

### Commands to run both applications

```bash
# Terminal 1 — backend (seed first, then start)
cd backend
npm run seed     # one-time: populates MongoDB with sample data
npm start

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`, log in with `ayushi@example.com` / `password123`,
browse the fleet, book a vehicle, and check My Bookings.
