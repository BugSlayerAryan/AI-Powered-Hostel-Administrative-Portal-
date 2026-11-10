# Setup guide

1. Install Node.js 20+.
2. Keep `backend/.env` on the development machine only. It is ignored by Git.
3. Ensure `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, and `GROQ_MODEL` are set. Set `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` before first provisioning.
4. Run `npm install`, `npm --prefix backend install`, and `npm --prefix frontend install`.
5. Run `npm run seed` once to provision a Super Admin and starter hostel.
6. Run `npm run dev`; open `http://localhost:5173`.
7. Verify `http://localhost:5000/api/health` reports database connected after the API starts.
8. Create wardens and students via Super Admin and assign the warden to a hostel.

For production, use a managed secret store, TLS reverse proxy, secure same-site cookies, durable private object storage, backups, and separate operational schemas. Configure `CLIENT_ORIGIN` to the deployed client origin. Never expose `.env` to a frontend build.
