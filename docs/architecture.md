# Architecture

React, TypeScript, and Vite form the client. Express and TypeScript provide REST endpoints, authenticate requests with JWTs, enforce the three roles, and scope Warden records to their assigned hostel. Mongoose persists users, hostels, operational records, and notifications in Atlas.

The AI module calls the Groq OpenAI-compatible chat completions endpoint from the backend only. Complaint classification validates the provider's JSON against supported categories and priorities. If AI is unavailable, the endpoint responds with pending status, while complaint submission remains available. The assistant retrieves hostel notices, menus, and policy records as context and asks the model to abstain when verified context is missing.

Files are saved in private backend upload directories. The upload metadata is stored in operational records. Storage paths are not returned as public URLs; downloads pass through an authenticated endpoint.

There are exactly three roles: Student, Super Admin, Hostel Warden. Mess administration is included in staff dashboards.
