# HostelOS

A role-based hostel administration portal for GITA Autonomous College. The synopsis supplies the academic project scope; the attached development brief defines exactly three account roles: `STUDENT`, `SUPER_ADMIN`, and `HOSTEL_WARDEN`. AI uses the configured Groq-compatible API on the backend.

## Requirements

Node.js 20+ and npm. A MongoDB Atlas database URI is configured locally in `backend/.env`.

## Run locally

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
npm run dev
```

Frontend: http://localhost:5173 · API: http://localhost:5000/api/health

## Provision the first Super Admin

The local environment file has a generated JWT signing secret and database/AI configuration. Set `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` in `backend/.env` (password must be at least 10 characters), then run:

```powershell
npm run seed
```

The seed command creates a starter hostel if needed and the first Super Admin account. It does not create public signup or fixed demo credentials. Login accepts the configured username or email. Super Admins can create student and warden accounts from their dashboard. Wardens must be assigned to a hostel.

## Build

```powershell
npm run build
```

## API

All routes except `/api/auth/login` and `/api/health` require a Bearer JWT. Login returns a 12-hour token.

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/dashboard`
- `GET/POST/PATCH /api/hostels` (Super Admin writes)
- `GET/POST /api/users` (Super Admin creates accounts; Super Admin/Warden can list scoped users)
- `GET/POST/PATCH/DELETE /api/{rooms,fees,complaints,attendance,notices,visitors,leave,mess,allocations,students}` with `page`, `limit`, `q`, `status` filters on list calls
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`
- `POST /api/ai/classify-complaint`, `POST /api/ai/chat`, `POST /api/ai/summarize-complaint`
- `POST /api/uploads?type=complaints|profiles|documents|receipts` (5 MB max); `GET /api/uploads/:id`
- `GET /api/audit-logs` (Super Admin)
- `GET /api/reports/export?kind=students` (role-scoped CSV reports)

## Data model

Mongoose collections include users, hostels, generic typed operational records (rooms, fees, complaints, attendance, notices, visitors, leave, mess, allocations, uploads, audit logs, and chatbot exchanges), and notifications. User credentials are separate from typed operational data. Records include timestamps, hostel/student references and query indexes. The typed operational collection keeps the academic prototype extensible; it is not a separate Mongoose collection per listed subject area.

## Security and data

- Keep `backend/.env` private; it is ignored by Git. `backend/.env.example` documents names without values.
- Do not put credentials in frontend code. The Groq API key is only read by backend services.
- Passwords use bcrypt; APIs enforce role and hostel scoping; Student endpoints attach the authenticated student identity.
- Uploads accept JPG, PNG, WebP, and PDF up to 5 MB with generated filenames. Downloads require authentication and hostel/student checks.
- Fee assignments create student balances; the classroom payment flow is explicitly simulated and requires Super Admin review. No real UPI or other payment service is connected.
- The supplied bot mascot is served from `frontend/public/assets/hostelos-bot.png` as the global floating assistant.
- Run `npm --prefix backend run smoke` to exercise the main workflows against Atlas. The script creates temporary users and records, then removes them.

See `docs/architecture.md`, `docs/database-schema.md`, `docs/api-documentation.md`, and `docs/setup-guide.md`.


## Current implementation limits

- First administrator provisioning requires you to set a username and password locally; no fixed demo accounts are created, and public privileged registration is disabled.
- Operational records currently share a typed Mongoose collection rather than separate collections for every module.
- Allocation, fee review, simulated payment and demo receipt workflows are implemented; CSV imports/exports and a few deeper module-specific reports still need completion before real campus operations.
- The UI has functional navigation and forms for common records, but not every requested module has full sorting, CSV transfer, filters, or every requested field.
- Chat retrieves role-scoped student or hostel operations data along with notices, menus, and any published policies. It should abstain when verified records are missing.
- Upload metadata is stored in MongoDB and files remain local. Back up `backend/uploads/` separately.
