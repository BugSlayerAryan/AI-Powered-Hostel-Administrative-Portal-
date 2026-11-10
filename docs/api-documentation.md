# API documentation

Base URL: `/api`. Except health and login, provide `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | API and DB status |
| POST | `/auth/login` | Authenticate using username or email and password |
| GET | `/auth/me` | Current account |
| POST | `/auth/logout` | Client session logout acknowledgment |
| GET | `/dashboard` | Scoped aggregate counters and recent records |
| GET/POST/PATCH | `/hostels` | List/create/update hostels |
| GET/POST | `/users` | List scoped users; Super Admin creates Student/Warden accounts |
| GET/POST/PATCH/DELETE | `/{kind}` | List/create/update/delete typed records; varies by role |
| POST | `/allocations` | Allocate student to a capacity-checked room (Warden/Super Admin) |
| POST | `/allocations/:id/release` | Release active room allocation |
| GET | `/rooms?available=true` | List capacity-available rooms for a Student's room-change request |
| POST | `/room-change` | Student submits a room-change request |
| POST | `/room-change/:id/process` | Approve/reject and transfer a room-change request |
| POST | `/fees/:id/demo-payment` | Submit a non-payable demonstration payment |
| PATCH | `/payments/:id` | Super Admin approves or rejects a simulated payment |
| GET | `/payments/:id/receipt` | Download approved demo receipt PDF |
| POST | `/ai/classify-complaint` | Groq JSON classification |
| POST | `/ai/chat` | Context-grounded student assistant |
| POST | `/ai/summarize-complaint` | Short complaint summary |
| GET | `/analytics` | Role-scoped complaint category, priority, and status aggregates |
| POST | `/ai/insights` | Groq summary from staff-authorized aggregates only |
| GET | `/notifications` | Current user's notifications |
| POST | `/uploads` | Authenticated local file upload |
| GET | `/uploads/:id` | Authorized private file download |
| GET | `/audit-logs` | Super Admin audit record listing |
| GET | `/reports/export?kind=students` | Download role-scoped CSV exports (students, rooms, fees, payments, complaints, attendance, leave, visitors, notices, mess; Super Admin may export hostels) |

List endpoints accept `page`, `limit` (up to 100), `q`, and `status`. Error responses use `{message}`. Update workflow states through PATCH on the relevant kind and record ID.
