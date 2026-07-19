# MediCare Backend API

A production-ready **Node.js + Express + MongoDB Atlas** backend for the MediCare doctor-appointment platform. Built with MVC architecture, JWT auth, role-based access control, file uploads, email notifications, and comprehensive validation/error handling.

> This is a **separate project** from the React frontend. It exposes REST APIs that the frontend consumes via `VITE_API_BASE_URL` (default `http://localhost:5000/api`).

---

## Tech Stack

| Concern | Library |
|--------|---------|
| Server | Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validation | `express-validator` |
| Security | `helmet`, `cors`, `express-rate-limit` |
| File Upload | `multer` |
| Email | `nodemailer` |
| Logging | `morgan` |
| Utilities | `cookie-parser`, `uuid`, `moment` |

---

## Project Structure

```
backend/
├── src/
│   ├── config/         # db connection, cors
│   ├── controllers/    # request handlers (auth, doctor, appointment, ...)
│   ├── middleware/     # auth, errorHandler, rateLimiter, upload, validate
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── services/       # (reserved for business logic)
│   ├── utils/          # response, jwt, email, asyncHandler, seed
│   ├── validations/    # express-validator chains
│   ├── uploads/        # uploaded doctor images (gitignored)
│   ├── sockets/        # (reserved for realtime)
│   ├── cron/           # (reserved for scheduled jobs)
│   ├── app.js          # Express app
│   └── server.js       # Entry point
├── .env                # Environment variables
├── package.json
└── README.md
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env .env.local   # then edit MONGODB_URI, JWT_SECRET, EMAIL_* etc.

# 3. Seed demo data (admin + 6 doctors + departments)
npm run seed

# 4. Run
npm run dev          # nodemon
# or
npm start            # production
```

The server listens on `PORT` (default **5002**).

### Demo Credentials (after seeding)

- **Admin:** `admin@demo.com` / `admin123`
- **Patient:** register via the API; the frontend demo uses `patient@demo.com` / `password123` (create your own patient through `/api/auth/register`).

---

## Standard Response Format

**Success**
```json
{ "success": true, "message": "...", "data": {} }
```

**Error**
```json
{ "success": false, "message": "...", "errors": [] }
```

---

## Authentication

All protected routes require an `Authorization: Bearer <token>` header (or the `token` httpOnly cookie).

Roles: `patient` | `admin`. Admin logs in only via `/api/auth/admin/login`.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register a patient |
| POST | `/auth/login` | Public | Patient login |
| POST | `/auth/logout` | Public | Logout (clears cookie) |
| POST | `/auth/forgot-password` | Public | Request password reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| GET | `/auth/me` | Patient | Current user profile |
| POST | `/auth/change-password` | Patient | Change password |
| PUT | `/auth/profile` | Patient | Update profile |
| POST | `/auth/admin/login` | Public | Admin login |

### Doctors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/doctors` | Public | List doctors (query: `search`, `specialization`, `availability`, `status`) |
| GET | `/doctors/:id` | Public | Doctor detail |
| POST | `/doctors` | Admin | Add doctor (multipart `image`) |
| PUT | `/doctors/:id` | Admin | Update doctor (multipart `image`) |
| DELETE | `/doctors/:id` | Admin | Delete doctor |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/appointments/booked-slots?doctorId=&date=` | Public | Booked slots (frontend disables these) |
| POST | `/appointments/book` | Patient | Book appointment |
| GET | `/appointments/my` | Patient | My appointments (query: `status`, `page`, `limit`, `sort`) |
| GET | `/appointments/:id` | Patient/Admin | Appointment detail |
| PATCH | `/appointments/:id/cancel` | Patient | Cancel own appointment |
| GET | `/appointments` | Admin | All appointments (search/filter/paginate) |
| PATCH | `/appointments/:id/status` | Admin | Confirm / Cancel / Complete |
| DELETE | `/appointments/:id` | Admin | Delete appointment |

**Booking validation (POST `/appointments/book`):**
1. Doctor must exist.
2. Doctor must be `active`.
3. Date must be valid & not in the past (`YYYY-MM-DD`).
4. Time slot must belong to the doctor.
5. Slot must not already be booked → returns **409** `This appointment slot has already been booked.`

### Patients (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/patients` | Admin | List patients (search/paginate) |
| GET | `/patients/:id` | Admin | Patient detail + appointment count |

### Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/contact` | Public | Submit contact message |
| GET | `/contact` | Admin | List messages |
| PATCH | `/contact/:id/read` | Admin | Mark message read |
| DELETE | `/contact/:id` | Admin | Delete message |

### Dashboard (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Stats: totalDoctors, totalPatients, totalAppointments, todaysAppointments, completed, cancelled, revenue |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Any | List my notifications + unread count |
| PATCH | `/notifications/:id/read` | Any | Mark one read |
| PATCH | `/notifications/read-all` | Any | Mark all read |

---

## Double-Booking Protection

A unique compound index on `(doctor, date, time)` guarantees no two appointments share the same slot. The booking flow also pre-checks and returns `409` with the exact message the frontend expects, so booked slots are automatically disabled in the UI.

---

## Security

- **Helmet** security headers
- **CORS** restricted to the frontend origin
- **Rate limiting** on all `/api` routes + stricter limits on auth
- **bcrypt** password hashing
- **JWT** auth with expiry
- **express-validator** input validation + sanitization
- **Mongo injection** protection via Mongoose ODM
- Central error middleware — the server never crashes on bad input

---

## Environment Variables

See `.env`. Key ones: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL`, `EMAIL_*`, `MAX_FILE_SIZE`, `RATE_LIMIT_*`.
