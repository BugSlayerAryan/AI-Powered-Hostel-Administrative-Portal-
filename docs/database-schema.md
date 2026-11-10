# Database schema

- **User**: name, unique normalized email, hidden bcrypt hash, role enum, assigned hostel, activation flag, login time, timestamps.
- **Hostel**: name, unique code, address, capacity, assigned warden, active flag, timestamps.
- **Resource**: typed operational record with kind discriminator and flexible module fields, hostel/student/user references, status, AI classification fields, upload metadata, timestamps. Compound query indexes support hostel and student timelines.
- **Notification**: recipient, title, message, read flag, link, timestamps.

Resource kinds used by the API include rooms, blocks, allocations, fees, payments, complaints, attendance, notices, visitors, leave, mess, policies, conversations, uploads, and audit-logs. The prototype uses one typed collection for these records; move high-volume kinds to dedicated models as requirements mature.

Uniqueness and indexes: User.email and Hostel.code are unique; role, hostel, student, status, and time query fields are indexed.
